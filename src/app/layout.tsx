import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "AI 简历定制系统",
  description: "智能简历定制，精准匹配岗位需求",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Sidebar />
        <main className="ml-60 min-h-screen p-6 print:ml-0">{children}</main>
      </body>
    </html>
  );
}
