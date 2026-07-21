"use client";

import { useState, useTransition } from "react";
import { addApplication, updateApplicationStatus, deleteApplication } from "./actions";
import { Plus, Trash2 } from "lucide-react";

interface Application {
  id: string;
  resumeId: string;
  company: string;
  position: string;
  status: string;
  note: string | null;
  appliedAt: Date;
}

interface Resume {
  id: string;
  title: string;
}

const statusOptions = [
  { value: "applied", label: "已投递" },
  { value: "interview", label: "面试中" },
  { value: "offer", label: "已获 Offer" },
  { value: "rejected", label: "已拒绝" },
];

const statusStyles: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  interview: "bg-yellow-100 text-yellow-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function ApplicationTracker({
  applications,
  resumes,
}: {
  applications: Application[];
  resumes: Resume[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addApplication(formData);
      setShowForm(false);
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateApplicationStatus(id, status);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteApplication(id);
    });
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">投递追踪</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> 记录投递
        </button>
      </div>

      {/* 添加表单 */}
      {showForm && (
        <form
          action={handleAdd}
          className="mb-4 space-y-3 rounded-md border border-[var(--border)] p-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="company"
              required
              placeholder="公司名称 *"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <input
              name="position"
              required
              placeholder="投递岗位 *"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <select
              name="resumeId"
              required
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">关联简历 *</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            <select
              name="status"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <input
            name="note"
            placeholder="备注（选填）"
            className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 投递列表 */}
      {applications.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          暂无投递记录，点击"记录投递"添加
        </p>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-md border border-[var(--border)] p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {app.company} - {app.position}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(app.appliedAt).toLocaleDateString("zh-CN")}
                  {app.note && ` · ${app.note}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium outline-none ${statusStyles[app.status] || "bg-gray-100 text-gray-700"}`}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(app.id)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
