"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addExperience(formData: FormData) {
  const type = (formData.get("type") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  if (!type || !title || !description) {
    return { error: "请填写类型、标题和描述等必填字段" };
  }

  await prisma.experience.create({
    data: {
      type,
      title,
      org: (formData.get("org") as string)?.trim() || null,
      role: (formData.get("role") as string)?.trim() || null,
      startDate: (formData.get("startDate") as string)?.trim() || null,
      endDate: (formData.get("endDate") as string)?.trim() || null,
      description,
      techStack: (formData.get("techStack") as string)?.trim() || null,
      achievements: (formData.get("achievements") as string)?.trim() || null,
      tags: (formData.get("tags") as string)?.trim() || null,
    },
  });

  revalidatePath("/experiences");
}

export async function updateExperience(id: string, formData: FormData) {
  const type = (formData.get("type") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  if (!type || !title || !description) {
    return { error: "请填写类型、标题和描述等必填字段" };
  }

  await prisma.experience.update({
    where: { id },
    data: {
      type,
      title,
      org: (formData.get("org") as string)?.trim() || null,
      role: (formData.get("role") as string)?.trim() || null,
      startDate: (formData.get("startDate") as string)?.trim() || null,
      endDate: (formData.get("endDate") as string)?.trim() || null,
      description,
      techStack: (formData.get("techStack") as string)?.trim() || null,
      achievements: (formData.get("achievements") as string)?.trim() || null,
      tags: (formData.get("tags") as string)?.trim() || null,
    },
  });

  revalidatePath("/experiences");
}

export async function deleteExperience(id: string) {
  await prisma.experience.delete({ where: { id } });
  revalidatePath("/experiences");
}

export async function archiveExperience(id: string) {
  await prisma.experience.update({
    where: { id },
    data: { isArchived: true },
  });
  revalidatePath("/experiences");
}

export async function unarchiveExperience(id: string) {
  await prisma.experience.update({
    where: { id },
    data: { isArchived: false },
  });
  revalidatePath("/experiences");
}
