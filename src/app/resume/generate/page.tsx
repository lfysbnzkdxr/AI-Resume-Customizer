"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ResumeGenerator } from "./resume-generator";

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const jdId = searchParams.get("jdId") || undefined;
  const expIds = searchParams.get("expIds");
  const defaultExpIds = expIds ? expIds.split(",").filter(Boolean) : undefined;

  const jd = useLiveQuery(
    async () => (jdId ? await db.parsedJDs.get(jdId) : undefined) ?? null,
    [jdId]
  );
  const experiences = useLiveQuery(
    () => db.experiences.where("isArchived").equals(0).reverse().sortBy("updatedAt")
  );
  const profile = useLiveQuery(() =>
    db.profiles.toCollection().first().then((p) => p ?? null)
  );
  const skills = useLiveQuery(() => db.skills.toArray());
  const educations = useLiveQuery(() => db.educations.toArray());

  if (!experiences || !skills || !educations || (jdId && jd === undefined)) {
    return <div className="animate-pulse p-8 text-center text-[var(--muted-foreground)]">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">生成定制简历</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          基于 JD 匹配结果，AI 自动改写经历描述并生成简历
        </p>
      </div>

      <ResumeGenerator
        jd={jd ?? null}
        experiences={experiences}
        profile={profile ?? null}
        skills={skills}
        educations={educations}
        defaultExpIds={defaultExpIds}
      />
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-8 text-center text-[var(--muted-foreground)]">加载中...</div>}>
      <GeneratePageInner />
    </Suspense>
  );
}
