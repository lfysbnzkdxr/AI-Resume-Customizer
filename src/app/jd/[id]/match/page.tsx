import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MatchResult } from "./match-result";

export default async function MatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const jd = await prisma.parsedJD.findUnique({ where: { id } });

  if (!jd) {
    notFound();
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
