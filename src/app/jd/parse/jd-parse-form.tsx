"use client";

import { useState } from "react";
import Link from "next/link";
import { FileSearch, Loader2 } from "lucide-react";
import { parseJD, parseJDFromUrl } from "@/lib/services/jd";
import { JDDeleteButton } from "../jd-delete-button";

interface ParsedJD {
  id: string;
  source: string;
  jobTitle?: string;
  company?: string;
  skills: string[];
  parsedAt: Date;
}

interface ParseResult {
  id: string;
  jobTitle: string | null;
  company: string | null;
  skills: string[];
  requirements: string[];
  keywords: string[];
  responsibilities: string[];
}

export function JDParseForm({ recentJDs }: { recentJDs: ParsedJD[] }) {
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState("");

  async function handleParse() {
    if (!jdText.trim() && !jdUrl.trim()) {
      setError("请输入 JD 文本或链接");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      let jd;
      if (jdText.trim()) {
        jd = await parseJD(jdText.trim(), jdUrl.trim() || undefined);
      } else {
        jd = await parseJDFromUrl(jdUrl.trim());
      }
      setResult({
        id: jd.id,
        jobTitle: jd.jobTitle || null,
        company: jd.company || null,
        skills: jd.skills,
        requirements: jd.requirements,
        keywords: jd.keywords,
        responsibilities: jd.responsibilities,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "解析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              JD 文本（主要方式）
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={8}
              placeholder="粘贴完整的岗位描述文本..."
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              岗位链接（辅助方式）
            </label>
            <input
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              提示：部分平台可能需要手动复制 JD 文本，链接解析可能无法获取完整内容
            </p>
          </div>
          <button
            onClick={handleParse}
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 解析中...
              </>
            ) : (
              <>
                <FileSearch className="h-4 w-4" /> 开始解析
              </>
            )}
          </button>
          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}
        </div>
      </section>

      {/* 解析结果 */}
      {result && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-4 text-lg font-semibold">解析结果</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-[var(--muted-foreground)]">
                  岗位名称
                </span>
                <p className="font-medium">
                  {result.jobTitle || "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-[var(--muted-foreground)]">
                  公司
                </span>
                <p className="font-medium">{result.company || "-"}</p>
              </div>
            </div>

            {result.skills && result.skills.length > 0 && (
              <div>
                <span className="text-sm text-[var(--muted-foreground)]">
                  技能要求
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {result.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-[var(--secondary)] px-3 py-1 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.requirements && result.requirements.length > 0 && (
              <div>
                <span className="text-sm text-[var(--muted-foreground)]">
                  岗位要求
                </span>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {result.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.keywords && result.keywords.length > 0 && (
              <div>
                <span className="text-sm text-[var(--muted-foreground)]">
                  关键词
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {result.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded bg-[var(--accent)] px-2 py-0.5 text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.id && (
              <Link
                href={`/jd/${result.id}/match`}
                className="inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                查看匹配评估 →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* 历史记录 */}
      {recentJDs.length > 0 && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-4 text-lg font-semibold">最近解析</h2>
          <div className="space-y-2">
            {recentJDs.map((jd) => (
              <div
                key={jd.id}
                className="group flex items-center justify-between rounded-md border border-[var(--border)] p-3 hover:bg-[var(--accent)]"
              >
                <Link href={`/jd/${jd.id}/match`} className="flex-1">
                  <p className="text-sm font-medium">
                    {jd.jobTitle || "未命名岗位"}
                    {jd.company && ` - ${jd.company}`}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(jd.parsedAt).toLocaleString("zh-CN")}
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/jd/${jd.id}/match`}
                    className="text-sm text-[var(--primary)]"
                  >
                    查看匹配 →
                  </Link>
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <JDDeleteButton id={jd.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
