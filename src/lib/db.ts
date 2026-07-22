import Dexie, { type Table } from "dexie";
import { SEED_SKILL_MAPPINGS } from "./seed-data";

// ============ 类型定义（对应原 Prisma schema） ============

export interface Profile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  jobTitle?: string;
  summary?: string;
  updatedAt: Date;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  highlights?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: string;
}

export interface Experience {
  id: string;
  type: string; // project / internship / competition
  title: string;
  org?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  techStack?: string;
  achievements?: string;
  tags?: string;
  isArchived: number; // 0 = 活跃, 1 = 已归档（IndexedDB 不支持布尔值作为索引键）
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedJD {
  id: string;
  source: string; // text / url
  rawContent: string;
  url?: string;
  jobTitle?: string;
  company?: string;
  requirements: string[];
  skills: string[];
  keywords: string[];
  responsibilities: string[];
  parsedAt: Date;
}

export interface Resume {
  id: string;
  title: string;
  jdId?: string;
  content: Record<string, unknown>;
  template: string;
  version: number;
  matchScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  resumeId: string;
  company: string;
  position: string;
  status: string; // applied / interview / offer / rejected
  note?: string;
  appliedAt: Date;
}

export interface SkillMapping {
  id: string;
  canonical: string;
  alias: string;
  category?: string;
}

// ============ Dexie 数据库定义 ============

class AIResumeDB extends Dexie {
  profiles!: Table<Profile, string>;
  educations!: Table<Education, string>;
  skills!: Table<Skill, string>;
  experiences!: Table<Experience, string>;
  parsedJDs!: Table<ParsedJD, string>;
  resumes!: Table<Resume, string>;
  applications!: Table<Application, string>;
  skillMappings!: Table<SkillMapping, string>;

  constructor() {
    super("AIResumeDB");
    this.version(1).stores({
      profiles: "id, updatedAt",
      educations: "id",
      skills: "id, category",
      experiences: "id, type, isArchived, updatedAt",
      parsedJDs: "id, parsedAt",
      resumes: "id, jdId, updatedAt",
      applications: "id, resumeId, appliedAt",
      skillMappings: "id, canonical, alias",
    });
    // v2: 将 isArchived 从布尔值迁移为数字 0/1（IndexedDB 不支持布尔索引键）
    this.version(2).stores({
      profiles: "id, updatedAt",
      educations: "id",
      skills: "id, category",
      experiences: "id, type, isArchived, updatedAt",
      parsedJDs: "id, parsedAt",
      resumes: "id, jdId, updatedAt",
      applications: "id, resumeId, appliedAt",
      skillMappings: "id, canonical, alias",
    }).upgrade((tx) => {
      return tx.table("experiences").toCollection().modify((exp) => {
        if (typeof exp.isArchived === "boolean") {
          exp.isArchived = exp.isArchived ? 1 : 0;
        }
      });
    });
    // 仅在数据库首次创建时写入种子数据
    this.on("populate", () => {
      this.skillMappings.bulkAdd(SEED_SKILL_MAPPINGS);
    });
  }
}

export const db = new AIResumeDB();

// ============ 工具函数 ============

/** 生成唯一 ID（浏览器原生） */
export function generateId(): string {
  return crypto.randomUUID();
}
