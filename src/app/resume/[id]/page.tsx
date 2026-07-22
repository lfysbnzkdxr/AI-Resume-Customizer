"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useParams } from "next/navigation";
import { ResumeView } from "./resume-view";

export default function ResumeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const resume = useLiveQuery(() => db.resumes.get(id).then((r) => r ?? null), [id]);

  if (resume === undefined) {
    return <div className="animate-pulse p-8 text-center text-[var(--muted-foreground)]">加载中...</div>;
  }

  if (!resume) {
    return <div className="p-8 text-center text-[var(--muted-foreground)]">简历不存在</div>;
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
