import { db } from "./db";

const EXPORT_VERSION = 1;

interface ExportData {
  version: number;
  exportedAt: string;
  data: {
    profiles: unknown[];
    educations: unknown[];
    skills: unknown[];
    experiences: unknown[];
    parsedJDs: unknown[];
    resumes: unknown[];
    applications: unknown[];
    skillMappings: unknown[];
  };
}

/** 将 ISO 字符串还原为 Date 对象 */
function reviveDates(obj: Record<string, unknown>, dateFields: string[]): Record<string, unknown> {
  const result = { ...obj };
  for (const field of dateFields) {
    if (typeof result[field] === "string") {
      const d = new Date(result[field] as string);
      if (!isNaN(d.getTime())) {
        result[field] = d;
      }
    }
  }
  return result;
}

/** 校验数组元素是否含有非空 id */
function validateRecords(arr: unknown[], tableName: string): void {
  if (!Array.isArray(arr)) return;
  for (const item of arr) {
    if (!item || typeof item !== "object" || !("id" in item) || !(item as Record<string, unknown>).id) {
      throw new Error(`备份文件中 ${tableName} 数据格式无效`);
    }
  }
}

/** 导出全部数据为 JSON 字符串 */
export async function exportAllData(): Promise<string> {
  const [profiles, educations, skills, experiences, parsedJDs, resumes, applications, skillMappings] =
    await Promise.all([
      db.profiles.toArray(),
      db.educations.toArray(),
      db.skills.toArray(),
      db.experiences.toArray(),
      db.parsedJDs.toArray(),
      db.resumes.toArray(),
      db.applications.toArray(),
      db.skillMappings.toArray(),
    ]);

  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      profiles,
      educations,
      skills,
      experiences,
      parsedJDs,
      resumes,
      applications,
      skillMappings,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/** 从 JSON 字符串恢复全部数据（覆盖现有数据） */
export async function importAllData(json: string): Promise<void> {
  let parsed: ExportData;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("无效的备份文件格式");
  }

  if (!parsed.version || !parsed.data) {
    throw new Error("无效的备份文件格式");
  }

  // 结构校验
  const tables = ["profiles", "educations", "skills", "experiences", "parsedJDs", "resumes", "applications", "skillMappings"] as const;
  for (const table of tables) {
    if (parsed.data[table] !== undefined && parsed.data[table] !== null) {
      validateRecords(parsed.data[table], table);
    }
  }

  // Date 字段还原
  const profiles = (parsed.data.profiles || []).map((p) => reviveDates(p as Record<string, unknown>, ["updatedAt"]));
  const experiences = (parsed.data.experiences || []).map((e) => reviveDates(e as Record<string, unknown>, ["createdAt", "updatedAt"]));
  const parsedJDs = (parsed.data.parsedJDs || []).map((j) => reviveDates(j as Record<string, unknown>, ["parsedAt"]));
  const resumes = (parsed.data.resumes || []).map((r) => reviveDates(r as Record<string, unknown>, ["createdAt", "updatedAt"]));
  const applications = (parsed.data.applications || []).map((a) => reviveDates(a as Record<string, unknown>, ["appliedAt"]));

  await db.transaction(
    "rw",
    [db.profiles, db.educations, db.skills, db.experiences, db.parsedJDs, db.resumes, db.applications, db.skillMappings],
    async () => {
      await db.profiles.clear();
      await db.educations.clear();
      await db.skills.clear();
      await db.experiences.clear();
      await db.parsedJDs.clear();
      await db.resumes.clear();
      await db.applications.clear();

      // skillMappings：仅当导入数据含有映射时才覆盖，否则保留现有种子数据
      if (parsed.data.skillMappings?.length) {
        await db.skillMappings.clear();
        await db.skillMappings.bulkAdd(parsed.data.skillMappings as never[]);
      }

      if (profiles.length) await db.profiles.bulkAdd(profiles as never[]);
      if (parsed.data.educations?.length) await db.educations.bulkAdd(parsed.data.educations as never[]);
      if (parsed.data.skills?.length) await db.skills.bulkAdd(parsed.data.skills as never[]);
      if (experiences.length) await db.experiences.bulkAdd(experiences as never[]);
      if (parsedJDs.length) await db.parsedJDs.bulkAdd(parsedJDs as never[]);
      if (resumes.length) await db.resumes.bulkAdd(resumes as never[]);
      if (applications.length) await db.applications.bulkAdd(applications as never[]);
    }
  );
}

/** 清空所有用户数据（保留技能同义词映射） */
export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.profiles, db.educations, db.skills, db.experiences, db.parsedJDs, db.resumes, db.applications],
    async () => {
      await db.profiles.clear();
      await db.educations.clear();
      await db.skills.clear();
      await db.experiences.clear();
      await db.parsedJDs.clear();
      await db.resumes.clear();
      await db.applications.clear();
    }
  );
}
