"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { JDParseForm } from "./jd-parse-form";

export default function JDParsePage() {
  const recentJDs = useLiveQuery(
    () => db.parsedJDs.orderBy("parsedAt").reverse().limit(10).toArray()
  );

  if (!recentJDs) {
    return <div className="animate-pulse p-8 text-center text-[var(--muted-foreground)]">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">JD 智能解析</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          粘贴岗位 JD 文本或输入链接，AI 自动提取关键信息
        </p>
      </div>

      <JDParseForm recentJDs={recentJDs} />
    </div>
  );
}
