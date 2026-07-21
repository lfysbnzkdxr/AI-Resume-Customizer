"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteParsedJD(id: string) {
  // 先查出关联简历 ID
  const resumes = await prisma.resume.findMany({
    where: { jdId: id },
    select: { id: true },
  });
  // 级联删除投递记录、简历、JD（事务保证原子性）
  await prisma.$transaction([
    prisma.application.deleteMany({
      where: { resumeId: { in: resumes.map((r) => r.id) } },
    }),
    prisma.resume.deleteMany({ where: { jdId: id } }),
    prisma.parsedJD.delete({ where: { id } }),
  ]);
  revalidatePath("/jd/parse");
  revalidatePath("/resume");
  revalidatePath("/history");
}
