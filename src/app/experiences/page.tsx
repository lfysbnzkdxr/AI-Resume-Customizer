"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ExperienceList } from "./experience-list";

export default function ExperiencesPage() {
  const experiences = useLiveQuery(
    () => db.experiences.orderBy("updatedAt").reverse().toArray()
  );

  if (!experiences) {
    return <div className="animate-pulse p-8 text-center text-[var(--muted-foreground)]">加载中...</div>;
  }

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
