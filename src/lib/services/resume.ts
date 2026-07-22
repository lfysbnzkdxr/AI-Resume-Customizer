import { db, generateId, type Resume } from "@/lib/db";
import { chatCompletionJSON } from "@/lib/client-llm";

interface ResumeGenerateResult {
  title: string;
  summary: string;
  experiences: {
    id: string;
    title: string;
    org: string;
    role: string;
    period: string;
    description: string[];
  }[];
  matchScore: number | null;
}

/**
 * 生成定制简历
 * @param jdId 关联的 JD ID（可选）
 * @param experienceIds 选中的经历 ID 列表
 */
export async function generateResume(jdId: string | undefined, experienceIds: string[]): Promise<Resume> {
  if (!experienceIds.length) throw new Error("请至少选择一段经历");

  const profile = await db.profiles.toCollection().first();
  if (!profile) throw new Error("请先填写个人信息");

  const skills = await db.skills.toArray();
  const educations = await db.educations.toArray();
  const experiences = await db.experiences.bulkGet(experienceIds);
  const validExperiences = experiences.filter(Boolean) as NonNullable<(typeof experiences)[number]>[];

  // 获取 JD 上下文
  let jdContext = "";
  let jdKeywords: string[] = [];
  if (jdId) {
    const jd = await db.parsedJDs.get(jdId);
    if (jd) {
      jdKeywords = jd.keywords;
      jdContext = `
目标岗位: ${jd.jobTitle || "未知"}
公司: ${jd.company || "未知"}
技能要求: ${jd.skills.join(", ")}
关键词: ${jdKeywords.join(", ")}
`;
    }
  }

  const expDescriptions = validExperiences
    .map(
      (e) => `
[ID: ${e.id}] 【${e.type === "project" ? "项目" : e.type === "internship" ? "实习" : "竞赛"}】${e.title}
组织: ${e.org || "无"}
角色: ${e.role || "无"}
时间: ${e.startDate || ""} - ${e.endDate || "至今"}
原始描述: ${e.description}
技术栈: ${e.techStack || "无"}
成果: ${e.achievements || "无"}
`
    )
    .join("\n");

  const prompt = `你是一个专业的简历撰写专家。请根据以下信息生成一份专业的简历内容。

## 个人信息
姓名: ${profile.name}
电话: ${profile.phone || "未填写"}
邮箱: ${profile.email || "未填写"}
城市: ${profile.location || "未填写"}
求职意向: ${profile.jobTitle || "未填写"}
自我评价: ${profile.summary || "未填写"}

## 教育背景
${educations.map((e) => `${e.school} | ${e.major} | ${e.degree} | ${e.startDate}-${e.endDate || "至今"}${e.gpa ? ` | GPA: ${e.gpa}` : ""}`).join("\n") || "未填写"}

## 技能
${skills.map((s) => `${s.name}(${s.level})`).join(", ") || "未填写"}

## 经历（需要改写）
${expDescriptions}
${jdContext ? `## 目标岗位信息${jdContext}` : ""}

## 改写要求
1. 使用 STAR 法则（Situation-Task-Action-Result）重构每段经历描述
2. ${jdKeywords.length > 0 ? `自然融入以下关键词: ${jdKeywords.join(", ")}` : "突出量化成果和技术能力"}
3. 每段经历描述控制在 3-5 个要点
4. 使用动词开头，如"负责"、"设计"、"实现"、"优化"等
5. 突出与目标岗位相关的能力

请以 JSON 格式返回：
{
  "title": "简历标题（如：张三-前端开发工程师）",
  "summary": "优化后的自我评价（2-3句话）",
  "experiences": [
    {
      "id": "原经历ID",
      "title": "经历名称",
      "org": "组织",
      "role": "角色",
      "period": "时间段",
      "description": ["改写后的要点1", "改写后的要点2"]
    }
  ],
  "matchScore": 0-100的匹配度评分（如果没有目标岗位则为null）
}

只返回 JSON，不要其他内容。`;

  const parsed = await chatCompletionJSON<ResumeGenerateResult>(
    [{ role: "user", content: prompt }],
    { temperature: 0.5 }
  );

  const normalizedExperiences = Array.isArray(parsed.experiences)
    ? parsed.experiences.map((exp) => ({
        id: String(exp.id || ""),
        title: String(exp.title || ""),
        org: String(exp.org || ""),
        role: String(exp.role || ""),
        period: String(exp.period || ""),
        description: Array.isArray(exp.description)
          ? exp.description.map(String)
          : [String(exp.description || "")],
      }))
    : [];

  const resumeContent: Record<string, unknown> = {
    profile: {
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      location: profile.location,
      jobTitle: profile.jobTitle,
    },
    summary: parsed.summary,
    educations: educations.map((e) => ({
      school: e.school,
      major: e.major,
      degree: e.degree,
      period: `${e.startDate} - ${e.endDate || "至今"}`,
      gpa: e.gpa,
    })),
    skills: skills.map((s) => ({
      name: s.name,
      category: s.category,
      level: s.level,
    })),
    experiences: normalizedExperiences,
  };

  const now = new Date();

  // 如果同一 JD 已有简历，创建新版本（保留历史记录）
  let version = 1;
  if (jdId) {
    const existing = await db.resumes.where("jdId").equals(jdId).last();
    if (existing) {
      version = existing.version + 1;
    }
  }

  const resume: Resume = {
    id: generateId(),
    title: parsed.title || `${profile.name}-简历`,
    jdId: jdId || undefined,
    content: resumeContent,
    template: "default",
    version,
    matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : undefined,
    createdAt: now,
    updatedAt: now,
  };
  await db.resumes.add(resume);
  return resume;
}

// ============ Resume CRUD ============

export async function getResumes(): Promise<Resume[]> {
  return db.resumes.orderBy("updatedAt").reverse().toArray();
}

export async function getResume(id: string): Promise<Resume | undefined> {
  return db.resumes.get(id);
}

/** 删除简历及其关联的投递记录 */
export async function deleteResume(id: string): Promise<void> {
  await db.transaction("rw", [db.applications, db.resumes], async () => {
    await db.applications.where("resumeId").equals(id).delete();
    await db.resumes.delete(id);
  });
}
