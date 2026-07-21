import { prisma } from "@/lib/prisma";
import { JDParseForm } from "./jd-parse-form";

export default async function JDParsePage() {
  const recentJDs = await prisma.parsedJD.findMany({
    orderBy: { parsedAt: "desc" },
    take: 10,
  });

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
