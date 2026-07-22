"use client";

import { useState } from "react";
import { addExperience, deleteExperience, updateExperience, archiveExperience, unarchiveExperience } from "@/lib/services/experience";
import { Plus, Trash2, Pencil, X, Archive, ArchiveRestore } from "lucide-react";
import type { Experience } from "@/lib/db";

const typeLabels: Record<string, string> = {
  project: "项目",
  internship: "实习",
  competition: "竞赛",
};

const typeColors: Record<string, string> = {
  project: "bg-blue-100 text-blue-700",
  internship: "bg-green-100 text-green-700",
  competition: "bg-purple-100 text-purple-700",
};

export function ExperienceList({
  experiences,
}: {
  experiences: Experience[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered =
    filter === "all"
      ? experiences.filter((e) => !e.isArchived)
      : filter === "archived"
        ? experiences.filter((e) => e.isArchived)
        : experiences.filter((e) => e.type === filter && !e.isArchived);

  async function handleAdd(formData: FormData) {
    setError("");
    setSaving(true);
    try {
      await addExperience({
        type: (formData.get("type") as string) || "project",
        title: (formData.get("title") as string) || "",
        org: (formData.get("org") as string) || undefined,
        role: (formData.get("role") as string) || undefined,
        startDate: (formData.get("startDate") as string) || undefined,
        endDate: (formData.get("endDate") as string) || undefined,
        description: (formData.get("description") as string) || "",
        techStack: (formData.get("techStack") as string) || undefined,
        achievements: (formData.get("achievements") as string) || undefined,
        tags: (formData.get("tags") as string) || undefined,
      });
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "添加失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setSaving(true);
    try {
      await deleteExperience(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    setError("");
    setSaving(true);
    try {
      await updateExperience(id, {
        type: (formData.get("type") as string) || undefined,
        title: (formData.get("title") as string) || undefined,
        org: (formData.get("org") as string) || undefined,
        role: (formData.get("role") as string) || undefined,
        startDate: (formData.get("startDate") as string) || undefined,
        endDate: (formData.get("endDate") as string) || undefined,
        description: (formData.get("description") as string) || undefined,
        techStack: (formData.get("techStack") as string) || undefined,
        achievements: (formData.get("achievements") as string) || undefined,
        tags: (formData.get("tags") as string) || undefined,
      });
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: string) {
    setError("");
    setSaving(true);
    try {
      await archiveExperience(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "归档失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnarchive(id: string) {
    setError("");
    setSaving(true);
    try {
      await unarchiveExperience(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "恢复失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["all", "project", "internship", "competition", "archived"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === t
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] hover:bg-[var(--accent)]"
              }`}
            >
              {t === "all" ? "全部" : t === "archived" ? "已归档" : typeLabels[t]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> 新增经历
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="rounded-md bg-[var(--destructive)]/10 px-4 py-2 text-sm text-[var(--destructive)]">{error}</p>
      )}

      {/* 新增表单 */}
      {showForm && (
        <form
          action={handleAdd}
          className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">新增经历</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">类型 *</label>
              <select
                name="type"
                required
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="project">项目</option>
                <option value="internship">实习</option>
                <option value="competition">竞赛</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">名称 *</label>
              <input
                name="title"
                required
                placeholder="项目名称/公司名称/赛事名称"
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                组织/公司
              </label>
              <input
                name="org"
                placeholder="所在公司或组织"
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">角色</label>
              <input
                name="role"
                placeholder="如：前端负责人、队长"
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">开始时间</label>
              <input
                name="startDate"
                placeholder="如：2024.03"
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">结束时间</label>
              <input
                name="endDate"
                placeholder="如：2024.06（留空表示至今）"
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              经历描述 *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="详细描述你在这段经历中做了什么、怎么做的、取得了什么成果"
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">技术栈</label>
              <input
                name="techStack"
                placeholder="用逗号分隔，如：React, Node.js, MySQL"
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                成果/量化数据
              </label>
              <input
                name="achievements"
                placeholder="如：用户量增长50%、获得一等奖"
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">标签</label>
            <input
              name="tags"
              placeholder="用逗号分隔，如：全栈, AI, 团队协作"
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存经历"}
          </button>
        </form>
      )}

      {/* 经历列表 */}
      <div className="space-y-3">
        {filtered.map((exp) => (
          <div
            key={exp.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[exp.type] || "bg-gray-100 text-gray-700"}`}
                  >
                    {typeLabels[exp.type] || exp.type}
                  </span>
                  <h3 className="font-medium">{exp.title}</h3>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {[exp.org, exp.role, exp.startDate && `${exp.startDate} - ${exp.endDate || "至今"}`]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
                <p className="mt-2 text-sm whitespace-pre-line">
                  {exp.description}
                </p>
                {exp.techStack && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.techStack.split(",").map((tech, i) => (
                      <span
                        key={i}
                        className="rounded bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--secondary-foreground)]"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {exp.achievements && (
                  <p className="mt-2 text-sm font-medium text-[var(--primary)]">
                    成果：{exp.achievements}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {exp.isArchived ? (
                  <button
                    onClick={() => handleUnarchive(exp.id)}
                    className="text-[var(--muted-foreground)] hover:text-green-600"
                    title="恢复"
                  >
                    <ArchiveRestore className="h-4 w-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingId(editingId === exp.id ? null : exp.id)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(exp.id)}
                      className="text-[var(--muted-foreground)] hover:text-yellow-600"
                      title="归档"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 编辑表单 */}
            {editingId === exp.id && (
              <form
                action={(formData: FormData) => handleUpdate(exp.id, formData)}
                className="mt-4 space-y-4 rounded-md border border-[var(--border)] p-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">类型 *</label>
                    <select
                      name="type"
                      required
                      defaultValue={exp.type}
                      className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    >
                      <option value="project">项目</option>
                      <option value="internship">实习</option>
                      <option value="competition">竞赛</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">名称 *</label>
                    <input
                      name="title"
                      required
                      defaultValue={exp.title}
                      className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">组织/公司</label>
                    <input
                      name="org"
                      defaultValue={exp.org || ""}
                      className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">角色</label>
                    <input
                      name="role"
                      defaultValue={exp.role || ""}
                      className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">开始时间</label>
                    <input
                      name="startDate"
                      defaultValue={exp.startDate || ""}
                      className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">结束时间</label>
                    <input
                      name="endDate"
                      defaultValue={exp.endDate || ""}
                      placeholder="留空表示至今"
                      className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">经历描述 *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    defaultValue={exp.description}
                    className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">技术栈</label>
                    <input
                      name="techStack"
                      defaultValue={exp.techStack || ""}
                      placeholder="用逗号分隔"
                      className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">成果/量化数据</label>
                    <input
                      name="achievements"
                      defaultValue={exp.achievements || ""}
                      className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">标签</label>
                  <input
                    name="tags"
                    defaultValue={exp.tags || ""}
                    placeholder="用逗号分隔"
                    className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "保存中..." : "保存修改"}
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
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted-foreground)]">
            暂无经历记录，点击"新增经历"开始添加
          </div>
        )}
      </div>
    </div>
  );
}
