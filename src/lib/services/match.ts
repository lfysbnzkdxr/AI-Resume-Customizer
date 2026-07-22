import { db } from "@/lib/db";
import { chatCompletionJSON } from "@/lib/client-llm";
import { getSkillNormalizationMap, normalizeSkill } from "./skill-mapping";

export interface MatchResult {
  scores: {
    overall: number;
    skillMatch: number;
    projectRelevance: number;
    experienceFit: number;
  };
  summary: string;
  gapAnalysis: string[];
  recommendedExperiences: {
    id: string;
    title: string;
    type: string;
    relevanceScore: number;
    reason: string;
  }[];
}

/**
 * 对指定 JD 执行匹配评估
 * 从 IndexedDB 读取用户数据 + 调用 LLM 评估
 */
export async function evaluateMatch(jdId: string): Promise<MatchResult> {
  const jd = await db.parsedJDs.get(jdId);
  if (!jd) throw new Error("JD 不存在");

  const experiences = await db.experiences.where("isArchived").equals(0).toArray();
  const skills = await db.skills.toArray();
  const profile = await db.profiles.toCollection().first();

  // 技能归一化
  const normMap = await getSkillNormalizationMap();
  const normalizedJdSkills = jd.skills.map((s) => normalizeSkill(s, normMap));
  const normalizedUserSkills = skills.map((s) => ({
    ...s,
    canonical: normalizeSkill(s.name, normMap),
  }));

  const matchedSkills = normalizedJdSkills.filter((js) =>
    normalizedUserSkills.some((us) => us.canonical.toLowerCase() === js.toLowerCase())
  );
  const missingSkills = normalizedJdSkills.filter(
    (js) => !normalizedUserSkills.some((us) => us.canonical.toLowerCase() === js.toLowerCase())
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
- 技能要求: ${jd.skills.join(", ")}
- 岗位要求: ${jd.requirements.join("; ")}
- 关键词: ${jd.keywords.join(", ")}

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

  const parsed = await chatCompletionJSON<Record<string, unknown>>(
    [{ role: "user", content: prompt }],
    { temperature: 0.3 }
  );

  // 结构校验与归一化
  const scores = parsed.scores as Record<string, unknown> | undefined;
  return {
    scores: {
      overall: typeof scores?.overall === "number" ? scores.overall : 0,
      skillMatch: typeof scores?.skillMatch === "number" ? scores.skillMatch : 0,
      projectRelevance: typeof scores?.projectRelevance === "number" ? scores.projectRelevance : 0,
      experienceFit: typeof scores?.experienceFit === "number" ? scores.experienceFit : 0,
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
}
