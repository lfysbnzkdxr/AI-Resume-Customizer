"use client";

import { useState } from "react";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { getLLMHeaders } from "@/lib/client-llm";

interface Experience {
  id: string;
  type: string;
  title: string;
  org: string | null;
  role: string | null;
  description: string;
  techStack: string | null;
  achievements: string | null;
}

interface Profile {
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  jobTitle: string | null;
  summary: string | null;
}

interface Skill {
  name: string;
  category: string;
  level: string;
}

interface Education {
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string | null;
}

interface JD {
  id: string;
  jobTitle: string | null;
  company: string | null;
  skills: string | null;
  keywords: string | null;
}

interface Props {
  jd: JD | null;
  experiences: Experience[];
  profile: Profile | null;
  skills: Skill[];
  educations: Education[];
  defaultExpIds?: string[];
}

export function ResumeGenerator({
  jd,
  experiences,
  profile,
  skills,
  educations,
  defaultExpIds,
}: Props) {
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>(
    defaultExpIds?.length
      ? defaultExpIds.filter((id) => experiences.some((e) => e.id === id))
      : experiences.slice(0, 3).map((e) => e.id)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeId, setResumeId] = useState<string | null>(null);

  function toggleExp(id: string) {
    setSelectedExpIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    if (!profile) {
      setError("请先在个人信息页面填写基本信息");
      return;
    }
    if (selectedExpIds.length === 0) {
      setError("请至少选择一段经历");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: getLLMHeaders(),
        body: JSON.stringify({
          jdId: jd?.id || null,
          experienceIds: selectedExpIds,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "生成失败");
      }

      const data = await res.json();
      setResumeId(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (resumeId) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-[var(--primary)]" />
        <h2 className="mt-4 text-xl font-semibold">简历生成成功！</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">
          AI 已根据岗位要求改写了你的经历描述
        </p>
        <a
          href={`/resume/${resumeId}`}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <FileText className="h-4 w-4" /> 查看简历
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* JD 信息 */}
      {jd && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-2 text-lg font-semibold">目标岗位</h2>
          <p className="font-medium">
            {jd.jobTitle || "未知岗位"}
            {jd.company && ` - ${jd.company}`}
          </p>
          {jd.skills && (
            <div className="mt-2 flex flex-wrap gap-2">
              {((): string[] => {
                try {
                  return JSON.parse(jd.skills);
                } catch {
                  return [];
                }
              })().map((skill: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full bg-[var(--secondary)] px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 选择经历 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">
          选择要包含的经历（{selectedExpIds.length}/{experiences.length}）
        </h2>
        <div className="space-y-2">
          {experiences.map((exp) => (
            <label
              key={exp.id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${
                selectedExpIds.includes(exp.id)
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:bg-[var(--accent)]"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedExpIds.includes(exp.id)}
                onChange={() => toggleExp(exp.id)}
                className="mt-1 h-4 w-4 rounded border-[var(--input)]"
              />
              <div>
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {[exp.org, exp.role].filter(Boolean).join(" | ")}
                </p>
                {exp.techStack && (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    技术栈: {exp.techStack}
                  </p>
                )}
              </div>
            </label>
          ))}
          {experiences.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">
              暂无经历，请先在经历库中添加
            </p>
          )}
        </div>
      </section>

      {/* 生成按钮 */}
      <div className="text-center">
        {error && (
          <p className="mb-3 text-sm text-[var(--destructive)]">{error}</p>
        )}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> AI 正在生成简历...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> 生成定制简历
            </>
          )}
        </button>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          AI 将使用 STAR 法则改写经历描述，融入岗位关键词
        </p>
      </div>
    </div>
  );
}
