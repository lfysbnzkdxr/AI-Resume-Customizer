"use client";

import { useState, useTransition } from "react";
import { addEducation, deleteEducation, updateEducation } from "./actions";
import { Plus, Trash2, Pencil } from "lucide-react";

interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  gpa: string | null;
  highlights: string | null;
}

export function EducationSection({ educations }: { educations: Education[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addEducation(formData);
      setShowForm(false);
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    startTransition(async () => {
      await updateEducation(id, formData);
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEducation(id);
    });
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">教育背景</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> 添加
        </button>
      </div>

      {/* 已有教育经历列表 */}
      <div className="space-y-3">
        {educations.map((edu) => (
          <div key={edu.id}>
          <div
            className="flex items-start justify-between rounded-md border border-[var(--border)] p-4"
          >
            <div>
              <p className="font-medium">
                {edu.school} · {edu.major}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {edu.degree} | {edu.startDate} - {edu.endDate || "至今"}
                {edu.gpa && ` | GPA: ${edu.gpa}`}
              </p>
              {edu.highlights && (
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {edu.highlights}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditingId(editingId === edu.id ? null : edu.id)}
                className="text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                title="编辑"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(edu.id)}
                className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                title="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 编辑表单 */}
          {editingId === edu.id && (
            <form
              action={(formData: FormData) => handleUpdate(edu.id, formData)}
              className="mt-2 space-y-3 rounded-md border border-[var(--border)] p-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  name="school"
                  required
                  defaultValue={edu.school}
                  placeholder="学校名称 *"
                  className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <input
                  name="major"
                  required
                  defaultValue={edu.major}
                  placeholder="专业 *"
                  className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <select
                  name="degree"
                  required
                  defaultValue={edu.degree}
                  className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <option value="大专">大专</option>
                  <option value="本科">本科</option>
                  <option value="硕士">硕士</option>
                  <option value="博士">博士</option>
                </select>
                <input
                  name="gpa"
                  defaultValue={edu.gpa || ""}
                  placeholder="GPA（选填）"
                  className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <input
                  name="startDate"
                  required
                  defaultValue={edu.startDate}
                  placeholder="开始时间，如 2020.09"
                  className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <input
                  name="endDate"
                  defaultValue={edu.endDate || ""}
                  placeholder="结束时间，如 2024.06"
                  className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
              <input
                name="highlights"
                defaultValue={edu.highlights || ""}
                placeholder="在校亮点（选填）"
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "保存中..." : "保存修改"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]"
                >
                  取消
                </button>
              </div>
            </form>
          )}
          </div>
        ))}
        {educations.length === 0 && !showForm && (
          <p className="text-sm text-[var(--muted-foreground)]">
            暂无教育经历，点击"添加"按钮新增
          </p>
        )}
      </div>

      {/* 添加表单 */}
      {showForm && (
        <form
          action={handleAdd}
          className="mt-4 space-y-3 rounded-md border border-[var(--border)] p-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="school"
              required
              placeholder="学校名称 *"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <input
              name="major"
              required
              placeholder="专业 *"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <select
              name="degree"
              required
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">选择学历 *</option>
              <option value="大专">大专</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
            <input
              name="gpa"
              placeholder="GPA（选填）"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <input
              name="startDate"
              required
              placeholder="开始时间，如 2020.09"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <input
              name="endDate"
              placeholder="结束时间，如 2024.06"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <input
            name="highlights"
            placeholder="在校亮点（选填），如：奖学金、学生会等"
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
    </section>
  );
}
