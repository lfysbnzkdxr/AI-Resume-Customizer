"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileSearch,
  FileText,
  History,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "工作台", icon: LayoutDashboard },
  { href: "/profile", label: "个人信息", icon: User },
  { href: "/experiences", label: "经历库", icon: Briefcase },
  { href: "/jd/parse", label: "JD 解析", icon: FileSearch },
  { href: "/resume", label: "简历管理", icon: FileText },
  { href: "/history", label: "历史记录", icon: History },
  { href: "/settings", label: "设置", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)] print:hidden">
      <div className="flex h-14 items-center border-b border-[var(--sidebar-border)] px-4">
        <h1 className="text-lg font-bold text-[var(--sidebar-accent-foreground)]">
          AI 简历定制
        </h1>
      </div>
      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
