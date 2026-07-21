"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addApplication(formData: FormData) {
  const resumeId = (formData.get("resumeId") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const position = (formData.get("position") as string)?.trim();
  if (!resumeId || !company || !position) {
    return { error: "请填写简历、公司和职位等必填字段" };
  }

  await prisma.application.create({
    data: {
      resumeId,
      company,
      position,
      status: (formData.get("status") as string)?.trim() || "applied",
      note: (formData.get("note") as string)?.trim() || null,
    },
  });

  revalidatePath("/history");
}

export async function updateApplicationStatus(id: string, status: string) {
  await prisma.application.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/history");
}

export async function deleteApplication(id: string) {
  await prisma.application.delete({ where: { id } });
  revalidatePath("/history");
}
