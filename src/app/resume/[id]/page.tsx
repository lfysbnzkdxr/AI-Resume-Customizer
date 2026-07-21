import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResumeView } from "./resume-view";

export default async function ResumeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const resume = await prisma.resume.findUnique({ where: { id } });

  if (!resume) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{resume.title}</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            v{resume.version} · 更新于{" "}
            {new Date(resume.updatedAt).toLocaleString("zh-CN")}
            {resume.matchScore && ` · 匹配度 ${resume.matchScore}%`}
          </p>
        </div>
      </div>

      <ResumeView resume={resume} />
    </div>
  );
}
