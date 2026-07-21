"use client";

import { useTransition } from "react";
import { saveProfile } from "./actions";

interface ProfileFormProps {
  profile: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    location: string | null;
    jobTitle: string | null;
    summary: string | null;
  } | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await saveProfile(formData);
    });
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="mb-4 text-lg font-semibold">基本信息</h2>
      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">姓名 *</label>
            <input
              name="name"
              defaultValue={profile?.name ?? ""}
              required
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">求职意向</label>
            <input
              name="jobTitle"
              defaultValue={profile?.jobTitle ?? ""}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="如：前端开发工程师"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">手机号</label>
            <input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="请输入手机号"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">邮箱</label>
            <input
              name="email"
              type="email"
              defaultValue={profile?.email ?? ""}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="请输入邮箱"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">所在城市</label>
            <input
              name="location"
              defaultValue={profile?.location ?? ""}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="如：北京"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">自我评价</label>
          <textarea
            name="summary"
            defaultValue={profile?.summary ?? ""}
            rows={3}
            className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="简要描述你的核心优势和职业目标"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存基本信息"}
        </button>
      </form>
    </section>
  );
}
