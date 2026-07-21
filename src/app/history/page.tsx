import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileSearch, FileText } from "lucide-react";
import { ApplicationTracker } from "./application-tracker";

export default async function HistoryPage() {
  const recentJDs = await prisma.parsedJD.findMany({
    orderBy: { parsedAt: "desc" },
    take: 20,
  });

  const recentResumes = await prisma.resume.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">历史记录</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          查看 JD 解析记录、简历版本和投递追踪
        </p>
      </div>

      {/* 投递追踪 */}
      <ApplicationTracker applications={applications} resumes={recentResumes} />

      {/* JD 解析记录 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <FileSearch className="h-5 w-5" /> JD 解析记录
        </h2>
        {recentJDs.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            暂无解析记录
          </p>
        ) : (
          <div className="space-y-2">
            {recentJDs.map((jd) => (
              <Link
                key={jd.id}
                href={`/jd/${jd.id}/match`}
                className="flex items-center justify-between rounded-md border border-[var(--border)] p-3 hover:bg-[var(--accent)]"
              >
                <div>
                  <p className="text-sm font-medium">
                    {jd.jobTitle || "未命名岗位"}
                    {jd.company && ` - ${jd.company}`}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(jd.parsedAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <span className="text-xs text-[var(--primary)]">查看 →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 简历版本 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5" /> 简历版本
        </h2>
        {recentResumes.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            暂无简历记录
          </p>
        ) : (
          <div className="space-y-2">
            {recentResumes.map((resume) => (
              <Link
                key={resume.id}
                href={`/resume/${resume.id}`}
                className="flex items-center justify-between rounded-md border border-[var(--border)] p-3 hover:bg-[var(--accent)]"
              >
                <div>
                  <p className="text-sm font-medium">{resume.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    v{resume.version} ·{" "}
                    {new Date(resume.updatedAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                {resume.matchScore && (
                  <span className="text-sm text-[var(--primary)]">
                    {resume.matchScore}%
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
