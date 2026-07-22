import { db, generateId, type Profile, type Education, type Skill } from "@/lib/db";

// ============ Profile CRUD ============

export async function getProfile(): Promise<Profile | undefined> {
  return db.profiles.toCollection().first();
}

export async function saveProfile(data: Omit<Profile, "id" | "updatedAt">): Promise<void> {
  const existing = await db.profiles.toCollection().first();
  if (existing) {
    await db.profiles.update(existing.id, { ...data, updatedAt: new Date() });
  } else {
    await db.profiles.add({ ...data, id: generateId(), updatedAt: new Date() });
  }
}

// ============ Education CRUD ============

export async function getEducations(): Promise<Education[]> {
  return db.educations.toArray();
}

export async function addEducation(data: Omit<Education, "id">): Promise<void> {
  await db.educations.add({ ...data, id: generateId() });
}

export async function updateEducation(id: string, data: Partial<Omit<Education, "id">>): Promise<void> {
  await db.educations.update(id, data);
}

export async function deleteEducation(id: string): Promise<void> {
  await db.educations.delete(id);
}

// ============ Skill CRUD ============

export async function getSkills(): Promise<Skill[]> {
  return db.skills.toArray();
}

export async function addSkill(data: Omit<Skill, "id">): Promise<void> {
  await db.skills.add({ ...data, id: generateId() });
}

export async function updateSkill(id: string, data: Partial<Omit<Skill, "id">>): Promise<void> {
  await db.skills.update(id, data);
}

export async function deleteSkill(id: string): Promise<void> {
  await db.skills.delete(id);
}
