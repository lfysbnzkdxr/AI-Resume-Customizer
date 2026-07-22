import { db, generateId, type Application } from "@/lib/db";

export async function getApplications(): Promise<Application[]> {
  return db.applications.orderBy("appliedAt").reverse().toArray();
}

export async function getApplicationsByResume(resumeId: string): Promise<Application[]> {
  return db.applications.where("resumeId").equals(resumeId).toArray();
}

export async function addApplication(data: Omit<Application, "id" | "appliedAt">): Promise<void> {
  await db.applications.add({
    ...data,
    id: generateId(),
    appliedAt: new Date(),
  });
}

export async function updateApplication(id: string, data: Partial<Omit<Application, "id" | "appliedAt">>): Promise<void> {
  await db.applications.update(id, data);
}

export async function deleteApplication(id: string): Promise<void> {
  await db.applications.delete(id);
}

/** 删除某简历关联的所有投递记录 */
export async function deleteApplicationsByResume(resumeId: string): Promise<void> {
  await db.applications.where("resumeId").equals(resumeId).delete();
}
