"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useParams } from "next/navigation";
import { MatchResult } from "./match-result";

export default function MatchPage() {
  const params = useParams();
  const id = params.id as string;

  const jd = useLiveQuery(() => db.parsedJDs.get(id).then((j) => j ?? null), [id]);

  if (jd === undefined) {
    return <div className="animate-pulse p-8 text-center text-[var(--muted-foreground)]">加载中...</div>;
  }

  if (!jd) {
    return <div className="p-8 text-center text-[var(--muted-foreground)]">JD 不存在</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">匹配评估</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          {jd.jobTitle || "岗位"}
          {jd.company && ` - ${jd.company}`}
        </p>
      </div>

      <MatchResult jdId={jd.id} />
    </div>
  );
}
