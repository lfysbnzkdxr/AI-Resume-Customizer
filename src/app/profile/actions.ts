"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveProfile(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "请填写姓名" };
  }

  const data = {
    name,
    phone: (formData.get("phone") as string)?.trim() || null,
    email: (formData.get("email") as string)?.trim() || null,
    location: (formData.get("location") as string)?.trim() || null,
    jobTitle: (formData.get("jobTitle") as string)?.trim() || null,
    summary: (formData.get("summary") as string)?.trim() || null,
  };

  const existing = await prisma.profile.findFirst();

  if (existing) {
    await prisma.profile.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.profile.create({ data });
  }

  revalidatePath("/profile");
}

export async function addEducation(formData: FormData) {
  const school = (formData.get("school") as string)?.trim();
  const major = (formData.get("major") as string)?.trim();
  const degree = (formData.get("degree") as string)?.trim();
  const startDate = (formData.get("startDate") as string)?.trim();
  if (!school || !major || !degree || !startDate) {
    return { error: "请填写学校、专业、学位和开始时间" };
  }

  await prisma.education.create({
    data: {
      school,
      major,
      degree,
      startDate,
      endDate: (formData.get("endDate") as string)?.trim() || null,
      gpa: (formData.get("gpa") as string)?.trim() || null,
      highlights: (formData.get("highlights") as string)?.trim() || null,
    },
  });

  revalidatePath("/profile");
}

export async function updateEducation(id: string, formData: FormData) {
  const school = (formData.get("school") as string)?.trim();
  const major = (formData.get("major") as string)?.trim();
  const degree = (formData.get("degree") as string)?.trim();
  const startDate = (formData.get("startDate") as string)?.trim();
  if (!school || !major || !degree || !startDate) {
    return { error: "请填写学校、专业、学位和开始时间" };
  }

  await prisma.education.update({
    where: { id },
    data: {
      school,
      major,
      degree,
      startDate,
      endDate: (formData.get("endDate") as string)?.trim() || null,
      gpa: (formData.get("gpa") as string)?.trim() || null,
      highlights: (formData.get("highlights") as string)?.trim() || null,
    },
  });

  revalidatePath("/profile");
}

export async function deleteEducation(id: string) {
  await prisma.education.delete({ where: { id } });
  revalidatePath("/profile");
}

export async function addSkill(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const level = (formData.get("level") as string)?.trim();
  if (!name || !category || !level) {
    return { error: "请填写技能名称、分类和熟练度" };
  }

  await prisma.skill.create({
    data: { name, category, level },
  });

  revalidatePath("/profile");
}

export async function updateSkill(id: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const level = (formData.get("level") as string)?.trim();
  if (!name || !category || !level) {
    return { error: "请填写技能名称、分类和熟练度" };
  }

  await prisma.skill.update({
    where: { id },
    data: { name, category, level },
  });

  revalidatePath("/profile");
}

export async function deleteSkill(id: string) {
  await prisma.skill.delete({ where: { id } });
  revalidatePath("/profile");
}
