"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { getLLMHeaders } from "@/lib/client-llm";

interface MatchScore {
  overall: number;
  skillMatch: number;
  projectRelevance: number;
  experienceFit: number;
}

interface RecommendedExperience {
  id: string;
  title: string;
  type: string;
  relevanceScore: number;
  reason: string;
}

interface MatchData {
  scores: MatchScore;
  gapAnalysis: string[];
  recommendedExperiences: RecommendedExperience[];
  summary: string;
}

export function MatchResult({ jdId }: { jdId: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MatchData | null>(null);
  const [error, setError] = useState("");

  async function handleMatch() {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/jd/${jdId}/match`, {
        method: "POST",
        headers: getLLMHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "匹配失败");
      }
      const result = await res.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "匹配失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (!data && !loading && !error) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <p className="mb-4 text-[var(--muted-foreground)]">
          点击开始评估你的经历与该岗位的匹配度
        </p>
        <button
          onClick={handleMatch}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> 开始匹配评估
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <span className="ml-3 text-[var(--muted-foreground)]">
          AI 正在分析匹配度...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--destructive)] bg-[var(--card)] p-6">
        <p className="text-[var(--destructive)]">{error}</p>
        <button
          onClick={handleMatch}
          className="mt-3 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 总分 */}
      {data && (
        <>
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="mb-4 text-lg font-semibold">匹配度评分</h2>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[var(--primary)]">
                <span className="text-2xl font-bold text-[var(--primary)]">
                  {data.scores.overall}
                </span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {data.summary}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ScoreBar
                label="技能匹配"
                score={data.scores.skillMatch}
              />
              <ScoreBar
                label="项目相关"
                score={data.scores.projectRelevance}
              />
              <ScoreBar
                label="经验契合"
                score={data.scores.experienceFit}
              />
            </div>
          </section>

          {/* 推荐经历 */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="mb-4 text-lg font-semibold">推荐经历（按相关度排序）</h2>
            <div className="space-y-3">
              {data.recommendedExperiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className="flex items-start gap-3 rounded-md border border-[var(--border)] p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{exp.title}</p>
                      <span className="text-sm font-medium text-[var(--primary)]">
                        {exp.relevanceScore}% 相关
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {exp.reason}
                    </p>
                  </div>
                </div>
              ))}
              {data.recommendedExperiences.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  暂无匹配的经历，请先在经历库中添加相关经历
                </p>
              )}
            </div>
          </section>

          {/* 差距分析 */}
          {data.gapAnalysis.length > 0 && (
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
              <h2 className="mb-4 text-lg font-semibold">差距分析</h2>
              <ul className="space-y-2">
                {data.gapAnalysis.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--destructive)]" />
                    {gap}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 生成简历按钮（传递推荐经历 ID） */}
          <div className="text-center">
            <a
              href={`/resume/generate?jdId=${jdId}&expIds=${data.recommendedExperiences.map((e) => e.id).join(",")}`}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> 基于匹配结果生成简历
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-[var(--muted-foreground)]">{label}</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--secondary)]">
        <div
          className="h-2 rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
