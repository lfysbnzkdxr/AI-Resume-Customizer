import { db } from "@/lib/db";

/**
 * 获取技能归一化映射表
 * 返回 alias(小写) -> canonical 的 Map
 */
export async function getSkillNormalizationMap(): Promise<Map<string, string>> {
  const mappings = await db.skillMappings.toArray();
  const map = new Map<string, string>();
  for (const m of mappings) {
    map.set(m.alias.toLowerCase(), m.canonical);
    map.set(m.canonical.toLowerCase(), m.canonical);
  }
  return map;
}

/** 归一化单个技能名称 */
export function normalizeSkill(skill: string, map: Map<string, string>): string {
  return map.get(skill.toLowerCase()) || skill;
}

/** 归一化技能数组 */
export function normalizeSkills(skills: string[], map: Map<string, string>): string[] {
  return skills.map((s) => normalizeSkill(s, map));
}
