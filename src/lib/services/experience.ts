import { db, generateId, type Experience } from "@/lib/db";

export async function getExperiences(includeArchived = false): Promise<Experience[]> {
  if (includeArchived) {
    return db.experiences.orderBy("updatedAt").reverse().toArray();
  }
  return db.experiences.where("isArchived").equals(0).reverse().sortBy("updatedAt");
}

export async function addExperience(data: Omit<Experience, "id" | "isArchived" | "createdAt" | "updatedAt">): Promise<void> {
  const now = new Date();
  await db.experiences.add({
    ...data,
    id: generateId(),
    isArchived: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateExperience(id: string, data: Partial<Omit<Experience, "id" | "createdAt">>): Promise<void> {
  await db.experiences.update(id, { ...data, updatedAt: new Date() });
}

export async function deleteExperience(id: string): Promise<void> {
  await db.experiences.delete(id);
}

export async function archiveExperience(id: string): Promise<void> {
  await db.experiences.update(id, { isArchived: 1, updatedAt: new Date() });
}

export async function unarchiveExperience(id: string): Promise<void> {
  await db.experiences.update(id, { isArchived: 0, updatedAt: new Date() });
}
