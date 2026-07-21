import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, extractLLMOverrides } from "@/lib/llm";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 获取 JD 信息
    const jd = await prisma.parsedJD.findUnique({ where: { id } });
    if (!jd) {
      return NextResponse.json({ error: "JD 不存在" }, { status: 404 });
    }

    // 获取用户所有经历和技能
    const experiences = await prisma.experience.findMany({
      where: { isArchived: false },
    });
    const skills = await prisma.skill.findMany();
    const profile = await prisma.profile.findFirst();

    // 获取技能同义词映射，用于技能归一化
    const skillMappings = await prisma.skillMapping.findMany();
    const aliasToCanonical = new Map<string, string>();
    skillMappings.forEach((m) => {
      aliasToCanonical.set(m.alias.toLowerCase(), m.canonical);
      aliasToCanonical.set(m.canonical.toLowerCase(), m.canonical);
    });

    // 技能归一化函数
    const normalizeSkill = (skill: string): string => {
      return aliasToCanonical.get(skill.toLowerCase()) || skill;
    };

    const jdSkills = JSON.parse(jd.skills || "[]");
    const jdRequirements = JSON.parse(jd.requirements || "[]");
    const jdKeywords = JSON.parse(jd.keywords || "[]");

    // 归一化 JD 技能和用户技能
    const normalizedJdSkills = jdSkills.map((s: string) => normalizeSkill(s));
    const normalizedUserSkills = skills.map((s) => ({
      ...s,
      canonical: normalizeSkill(s.name),
    }));

    // 计算技能匹配提示
    const matchedSkills = normalizedJdSkills.filter((js: string) =>
      normalizedUserSkills.some((us) => us.canonical.toLowerCase() === js.toLowerCase())
    );
    const missingSkills = normalizedJdSkills.filter(
      (js: string) => !normalizedUserSkills.some((us) => us.canonical.toLowerCase() === js.toLowerCase())
    );

    const userSkills = skills.map((s) => `${s.name}(${s.level})`).join(", ");
    const userExperiences = experiences
      .map(
        (e) =>
          `[ID: ${e.id}] [${e.type}] ${e.title} | ${e.org || ""} | 技术栈: ${e.techStack || "无"} | 描述: ${e.description} | 成果: ${e.achievements || "无"}`
      )
      .join("\n");

    const prompt = `你是一个专业的简历匹配评估专家。请根据岗位要求评估候选人的匹配度。

## 岗位信息
- 岗位: ${jd.jobTitle || "未知"}
- 公司: ${jd.company || "未知"}
- 技能要求: ${jdSkills.join(", ")}
- 岗位要求: ${jdRequirements.join("; ")}
- 关键词: ${jdKeywords.join(", ")}

## 候选人信息
- 求职意向: ${profile?.jobTitle || "未设置"}
- 技能: ${userSkills || "未填写"}
- 经历:
${userExperiences || "无经历记录"}

## 技能匹配分析（基于同义词归一化）
- 已匹配技能: ${matchedSkills.length > 0 ? matchedSkills.join(", ") : "无"}
- 缺失技能: ${missingSkills.length > 0 ? missingSkills.join(", ") : "无"}
注：技能比较已考虑同义词（如 React.js = React，TS = TypeScript）

## 评估要求
请以 JSON 格式返回评估结果：
{
  "scores": {
    "overall": 0-100的总分,
    "skillMatch": 0-100技能匹配分,
    "projectRelevance": 0-100项目相关分,
    "experienceFit": 0-100经验契合分
  },
  "summary": "一句话总结匹配情况",
  "gapAnalysis": ["差距1", "差距2"],
  "recommendedExperiences": [
    {
      "id": "经历ID",
      "title": "经历名称",
      "type": "经历类型",
      "relevanceScore": 0-100相关度,
      "reason": "推荐理由"
    }
  ]
}

注意：
1. recommendedExperiences 中的 id 必须使用上面经历列表中的实际 ID
2. 按相关度从高到低排序
3. 差距分析要具体、有建设性
4. 只返回 JSON，不要其他内容`;

    const result = await chatCompletion(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, responseFormat: "json", overrides: extractLLMOverrides(request.headers) }
    );

    const parsed = JSON.parse(result);

    // 结构校验与归一化
    const validated = {
      scores: {
        overall: typeof parsed.scores?.overall === "number" ? parsed.scores.overall : 0,
        skillMatch: typeof parsed.scores?.skillMatch === "number" ? parsed.scores.skillMatch : 0,
        projectRelevance: typeof parsed.scores?.projectRelevance === "number" ? parsed.scores.projectRelevance : 0,
        experienceFit: typeof parsed.scores?.experienceFit === "number" ? parsed.scores.experienceFit : 0,
      },
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      gapAnalysis: Array.isArray(parsed.gapAnalysis) ? parsed.gapAnalysis : [],
      recommendedExperiences: Array.isArray(parsed.recommendedExperiences)
        ? parsed.recommendedExperiences.map((exp: Record<string, unknown>) => ({
            id: String(exp.id || ""),
            title: String(exp.title || ""),
            type: String(exp.type || ""),
            relevanceScore: typeof exp.relevanceScore === "number" ? exp.relevanceScore : 0,
            reason: String(exp.reason || ""),
          }))
        : [],
    };

    return NextResponse.json(validated);
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json(
      { error: "匹配评估失败，请检查 API 配置或重试" },
      { status: 500 }
    );
  }
}
