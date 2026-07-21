import { prisma } from "@/lib/prisma";
import { ResumeGenerator } from "./resume-generator";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: { jdId?: string; expIds?: string };
}) {
  const { jdId, expIds } = searchParams;

  // 解析推荐经历 ID
  const defaultExpIds = expIds ? expIds.split(",").filter(Boolean) : undefined;

  let jd = null;
  if (jdId) {
    jd = await prisma.parsedJD.findUnique({ where: { id: jdId } });
  }

  const experiences = await prisma.experience.findMany({
    where: { isArchived: false },
    orderBy: { updatedAt: "desc" },
  });

  const profile = await prisma.profile.findFirst();
  const skills = await prisma.skill.findMany();
  const educations = await prisma.education.findMany();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">生成定制简历</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          基于 JD 匹配结果，AI 自动改写经历描述并生成简历
        </p>
      </div>

      <ResumeGenerator
        jd={jd}
        experiences={experiences}
        profile={profile}
        skills={skills}
        educations={educations}
        defaultExpIds={defaultExpIds}
      />
    </div>
  );
}
