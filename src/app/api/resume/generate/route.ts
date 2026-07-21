import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, extractLLMOverrides } from "@/lib/llm";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { jdId, experienceIds } = await request.json();

    // 校验 experienceIds
    if (!Array.isArray(experienceIds) || experienceIds.length === 0) {
      return NextResponse.json(
        { error: "请至少选择一段经历" },
        { status: 400 }
      );
    }

    // 获取用户信息
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json(
        { error: "请先填写个人信息" },
        { status: 400 }
      );
    }

    const skills = await prisma.skill.findMany();
    const educations = await prisma.education.findMany();
    const experiences = await prisma.experience.findMany({
      where: { id: { in: experienceIds } },
    });

    // 获取 JD 信息
    let jdContext = "";
    let jdKeywords: string[] = [];
    if (jdId) {
      const jd = await prisma.parsedJD.findUnique({ where: { id: jdId } });
      if (jd) {
        jdKeywords = JSON.parse(jd.keywords || "[]");
        jdContext = `
目标岗位: ${jd.jobTitle || "未知"}
公司: ${jd.company || "未知"}
技能要求: ${JSON.parse(jd.skills || "[]").join(", ")}
关键词: ${jdKeywords.join(", ")}
`;
      }
    }

    // 构建经历描述（包含 ID）
    const expDescriptions = experiences
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
      "description": ["改写后的要点1", "改写后的要点2", ...]
    }
  ],
  "matchScore": 0-100的匹配度评分（如果没有目标岗位则为null）
}

只返回 JSON，不要其他内容。`;

    const result = await chatCompletion(
      [{ role: "user", content: prompt }],
      { temperature: 0.5, responseFormat: "json", overrides: extractLLMOverrides(request.headers) }
    );

    const parsed = JSON.parse(result);

    // 结构校验与归一化
    const normalizedExperiences = Array.isArray(parsed.experiences)
      ? parsed.experiences.map((exp: Record<string, unknown>) => ({
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

    // 构建完整简历内容
    const resumeContent = {
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

    // 保存简历（如果同一 JD 已有简历，则更新并递增版本号）
    let resume;
    if (jdId) {
      const existingResume = await prisma.resume.findFirst({
        where: { jdId },
        orderBy: { version: "desc" },
      });
      if (existingResume) {
        resume = await prisma.resume.update({
          where: { id: existingResume.id },
          data: {
            title: parsed.title || `${profile.name}-简历`,
            content: JSON.stringify(resumeContent),
            matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : null,
            version: existingResume.version + 1,
          },
        });
      } else {
        resume = await prisma.resume.create({
          data: {
            title: parsed.title || `${profile.name}-简历`,
            jdId,
            content: JSON.stringify(resumeContent),
            matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : null,
          },
        });
      }
    } else {
      resume = await prisma.resume.create({
        data: {
          title: parsed.title || `${profile.name}-简历`,
          content: JSON.stringify(resumeContent),
          matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : null,
        },
      });
    }

    return NextResponse.json({ id: resume.id });
  } catch (error) {
    console.error("Resume generate error:", error);
    return NextResponse.json(
      { error: "简历生成失败，请检查 API 配置或重试" },
      { status: 500 }
    );
  }
}
