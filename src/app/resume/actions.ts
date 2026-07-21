"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteResume(id: string) {
  // 先删除关联的投递记录
  await prisma.application.deleteMany({ where: { resumeId: id } });
  await prisma.resume.delete({ where: { id } });
  revalidatePath("/resume");
  revalidatePath("/history");
}
