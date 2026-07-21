import Link from "next/link";
import {
  User,
  Briefcase,
  FileSearch,
  FileText,
  ArrowRight,
} from "lucide-react";

const quickActions = [
  {
    title: "个人信息",
    description: "管理基本信息、教育背景和技能",
    href: "/profile",
    icon: User,
  },
  {
    title: "经历库",
    description: "管理项目、实习和竞赛经历",
    href: "/experiences",
    icon: Briefcase,
  },
  {
    title: "JD 解析",
    description: "输入岗位 JD，智能解析匹配",
    href: "/jd/parse",
    icon: FileSearch,
  },
  {
    title: "简历管理",
    description: "查看和导出生成的简历",
    href: "/resume",
    icon: FileText,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">工作台</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          AI 智能简历定制系统 — 精准匹配，高效求职
        </p>
      </div>

      {/* 快捷操作 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">快捷操作</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <action.icon className="h-8 w-8 text-[var(--primary)]" />
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mt-3 font-medium">{action.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 使用流程 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">使用流程</h2>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                1
              </span>
              <span>
                完善<strong>个人信息</strong>和<strong>经历库</strong>
                （项目、实习、竞赛）
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                2
              </span>
              <span>
                粘贴目标岗位的 <strong>JD 文本</strong>或链接，系统自动解析
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                3
              </span>
              <span>
                查看<strong>匹配评估</strong>结果，系统推荐最相关的经历
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                4
              </span>
              <span>
                AI 自动<strong>改写经历描述</strong>，生成定制简历并导出 PDF
              </span>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
