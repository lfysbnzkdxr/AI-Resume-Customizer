import { prisma } from "@/lib/prisma";
import { ExperienceList } from "./experience-list";

export default async function ExperiencesPage() {
  const experiences = await prisma.experience.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">经历库</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          管理你的项目、实习和竞赛经历
        </p>
      </div>

      <ExperienceList experiences={experiences} />
    </div>
  );
}
