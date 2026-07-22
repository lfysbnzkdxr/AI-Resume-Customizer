import { db, generateId, type ParsedJD } from "@/lib/db";
import { chatCompletionJSON } from "@/lib/client-llm";

interface JDParseResult {
  jobTitle: string | null;
  company: string | null;
  requirements: string[];
  skills: string[];
  keywords: string[];
  responsibilities: string[];
}

/**
 * 解析 JD 文本（调用 LLM 提取结构化信息并存入 IndexedDB）
 */
export async function parseJD(text: string, url?: string): Promise<ParsedJD> {
  const prompt = `你是一个专业的招聘 JD 分析助手。请分析以下岗位描述，提取结构化信息。

请以 JSON 格式返回，包含以下字段：
- jobTitle: 岗位名称
- company: 公司名称（如果无法确定则为 null）
- requirements: 岗位要求数组（列出所有明确的要求）
- skills: 技能要求数组（提取所有提到的技术/技能）
- keywords: 关键词数组（用于简历匹配的核心词汇）
- responsibilities: 岗位职责数组

只返回 JSON，不要其他内容。

岗位描述：
${text}`;

  const parsed = await chatCompletionJSON<JDParseResult>(
    [{ role: "user", content: prompt }],
    { temperature: 0.3 }
  );

  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const jd: ParsedJD = {
    id: generateId(),
    source: url ? "url" : "text",
    rawContent: text,
    url: url || undefined,
    jobTitle: parsed.jobTitle || undefined,
    company: parsed.company || undefined,
    requirements: toStringArray(parsed.requirements),
    skills: toStringArray(parsed.skills),
    keywords: toStringArray(parsed.keywords),
    responsibilities: toStringArray(parsed.responsibilities),
    parsedAt: new Date(),
  };

  await db.parsedJDs.add(jd);
  return jd;
}

/**
 * 通过 URL 抓取内容后解析 JD
 * 先调用 /api/fetch-url 获取页面文本，再调 LLM 解析
 */
export async function parseJDFromUrl(url: string): Promise<ParsedJD> {
  const res = await fetch("/api/fetch-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "获取链接内容失败" }));
    throw new Error(data.error || "获取链接内容失败");
  }

  const { text } = await res.json();
  if (!text) throw new Error("链接内容为空，请直接粘贴 JD 文本");

  return parseJD(text, url);
}

// ============ ParsedJD CRUD ============

export async function getParsedJDs(): Promise<ParsedJD[]> {
  return db.parsedJDs.orderBy("parsedAt").reverse().toArray();
}

export async function getParsedJD(id: string): Promise<ParsedJD | undefined> {
  return db.parsedJDs.get(id);
}

/** 级联删除 JD 及其关联的简历和投递记录 */
export async function deleteParsedJD(id: string): Promise<void> {
  const resumes = await db.resumes.where("jdId").equals(id).toArray();
  const resumeIds = resumes.map((r) => r.id);

  await db.transaction("rw", [db.applications, db.resumes, db.parsedJDs], async () => {
    for (const resumeId of resumeIds) {
      await db.applications.where("resumeId").equals(resumeId).delete();
    }
    await db.resumes.where("jdId").equals(id).delete();
    await db.parsedJDs.delete(id);
  });
}
