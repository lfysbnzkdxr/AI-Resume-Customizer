"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import Link from "next/link";
import { FileText, Plus, Sparkles } from "lucide-react";
import { ResumeDeleteButton } from "./resume-delete-button";

export default function ResumePage() {
  const resumes = useLiveQuery(
    () => db.resumes.orderBy("updatedAt").reverse().toArray()
  );

  if (!resumes) {
    return <div className="animate-pulse p-8 text-center text-[var(--muted-foreground)]">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">简历管理</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            查看和管理生成的简历
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/resume/generate"
            className="flex items-center gap-1 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--accent)]"
          >
            <Sparkles className="h-4 w-4" /> 直接生成
          </Link>
          <Link
            href="/jd/parse"
            className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> 基于 JD 生成
          </Link>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-[var(--muted-foreground)]" />
          <p className="mt-4 text-[var(--muted-foreground)]">
            暂无简历，可以基于 JD 生成匹配简历，或直接生成通用简历
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/jd/parse"
              className="inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              基于 JD 生成
            </Link>
            <Link
              href="/resume/generate"
              className="inline-block rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]"
            >
              直接生成通用简历
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group relative rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 transition-shadow hover:shadow-md"
            >
              <Link href={`/resume/${resume.id}`} className="block">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{resume.title}</h3>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    v{resume.version}
                  </span>
                </div>
                {resume.matchScore && (
                  <p className="mt-2 text-sm text-[var(--primary)]">
                    匹配度: {resume.matchScore}%
                  </p>
                )}
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  更新于 {new Date(resume.updatedAt).toLocaleString("zh-CN")}
                </p>
              </Link>
              <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                <ResumeDeleteButton id={resume.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
