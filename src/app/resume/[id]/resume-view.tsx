"use client";

import { useState } from "react";
import { Download, FileText, Copy, Check } from "lucide-react";

interface ResumeData {
  id: string;
  title: string;
  content: Record<string, unknown>;
  matchScore?: number;
}

interface ResumeContent {
  profile: {
    name: string;
    phone: string | null;
    email: string | null;
    location: string | null;
    jobTitle: string | null;
  };
  summary: string;
  educations: {
    school: string;
    major: string;
    degree: string;
    period: string;
    gpa: string | null;
  }[];
  skills: {
    name: string;
    category: string;
    level: string;
  }[];
  experiences: {
    id: string;
    title: string;
    org: string;
    role: string;
    period: string;
    description: string[];
  }[];
}

export function ResumeView({ resume }: { resume: ResumeData }) {
  const [copied, setCopied] = useState(false);

  // 运行时校验简历内容结构
  const rawContent = resume.content as unknown as ResumeContent;
  if (
    !rawContent ||
    typeof rawContent !== "object" ||
    !rawContent.profile ||
    typeof rawContent.profile !== "object" ||
    !Array.isArray(rawContent.educations) ||
    !Array.isArray(rawContent.skills) ||
    !Array.isArray(rawContent.experiences)
  ) {
    return (
      <div className="rounded-lg border border-[var(--destructive)] bg-[var(--card)] p-6">
        <p className="text-[var(--destructive)]">简历内容解析失败，数据可能已损坏。请尝试重新生成简历。</p>
      </div>
    );
  }
  const content = rawContent;

  function generateMarkdown() {
    const { profile, summary, educations, skills, experiences } = content;
    let md = `# ${profile.name}\n\n`;

    // 联系方式
    const contacts = [profile.phone, profile.email, profile.location].filter(
      Boolean
    );
    if (contacts.length > 0) {
      md += `> ${contacts.join(" | ")}\n\n`;
    }

    if (profile.jobTitle) {
      md += `**求职意向：${profile.jobTitle}**\n\n`;
    }

    // 自我评价
    if (summary) {
      md += `## 自我评价\n\n${summary}\n\n`;
    }

    // 教育背景
    if (educations.length > 0) {
      md += `## 教育背景\n\n`;
      educations.forEach((edu) => {
        md += `**${edu.school}** | ${edu.major} | ${edu.degree}\n`;
        md += `${edu.period}`;
        if (edu.gpa) md += ` | GPA: ${edu.gpa}`;
        md += `\n\n`;
      });
    }

    // 技能
    if (skills.length > 0) {
      md += `## 专业技能\n\n`;
      const grouped = skills.reduce<Record<string, string[]>>(
        (acc, skill) => {
          if (!acc[skill.category]) acc[skill.category] = [];
          acc[skill.category].push(`${skill.name}(${skill.level})`);
          return acc;
        },
        {}
      );
      Object.entries(grouped).forEach(([category, catSkills]) => {
        md += `- **${category}**: ${catSkills.join(", ")}\n`;
      });
      md += `\n`;
    }

    // 经历
    if (experiences.length > 0) {
      md += `## 项目经历\n\n`;
      experiences.forEach((exp) => {
        md += `### ${exp.title}\n`;
        md += `**${exp.org}** | ${exp.role} | ${exp.period}\n\n`;
        exp.description.forEach((desc) => {
          md += `- ${desc}\n`;
        });
        md += `\n`;
      });
    }

    return md;
  }

  function handleCopyMarkdown() {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadMarkdown() {
    const blob = new Blob([generateMarkdown()], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${content.profile.name}-简历.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* 操作按钮 */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Download className="h-4 w-4" /> 导出 PDF（打印）
        </button>
        <button
          onClick={handleDownloadMarkdown}
          className="flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]"
        >
          <FileText className="h-4 w-4" /> 下载 Markdown
        </button>
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "已复制" : "复制 Markdown"}
        </button>
      </div>

      {/* 简历预览 */}
      <div className="mx-auto max-w-3xl rounded-lg border border-[var(--border)] bg-white p-8 text-black shadow-sm print:border-0 print:shadow-none">
        {/* 头部 */}
        <header className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold">{content.profile.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {content.profile.phone && <span>{content.profile.phone}</span>}
            {content.profile.email && <span>{content.profile.email}</span>}
            {content.profile.location && (
              <span>{content.profile.location}</span>
            )}
          </div>
          {content.profile.jobTitle && (
            <p className="mt-2 text-sm font-medium text-gray-800">
              求职意向：{content.profile.jobTitle}
            </p>
          )}
        </header>

        {/* 自我评价 */}
        {content.summary && (
          <section className="mt-4">
            <h2 className="mb-2 text-lg font-semibold">自我评价</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              {content.summary}
            </p>
          </section>
        )}

        {/* 教育背景 */}
        {content.educations.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-2 text-lg font-semibold">教育背景</h2>
            {content.educations.map((edu, i) => (
              <div key={i} className="mb-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {edu.school} · {edu.major}
                  </p>
                  <span className="text-sm text-gray-500">{edu.period}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {edu.degree}
                  {edu.gpa && ` | GPA: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* 技能 */}
        {content.skills.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-2 text-lg font-semibold">专业技能</h2>
            <div className="space-y-1">
              {Object.entries(
                content.skills.reduce<Record<string, string[]>>((acc, s) => {
                  if (!acc[s.category]) acc[s.category] = [];
                  acc[s.category].push(`${s.name}(${s.level})`);
                  return acc;
                }, {})
              ).map(([category, catSkills]) => (
                <p key={category} className="text-sm text-gray-700">
                  <span className="font-medium">{category}：</span>
                  {catSkills.join(", ")}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 经历 */}
        {content.experiences.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-2 text-lg font-semibold">项目经历</h2>
            {content.experiences.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{exp.title}</p>
                  <span className="text-sm text-gray-500">{exp.period}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {exp.org} | {exp.role}
                </p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
