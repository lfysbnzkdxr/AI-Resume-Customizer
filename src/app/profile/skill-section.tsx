"use client";

import { useState } from "react";
import { addSkill, deleteSkill, updateSkill } from "@/lib/services/profile";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Skill } from "@/lib/db";

export function SkillSection({ skills }: { skills: Skill[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(formData: FormData) {
    setError("");
    setSaving(true);
    try {
      await addSkill({
        name: (formData.get("name") as string) || "",
        category: (formData.get("category") as string) || "其他",
        level: (formData.get("level") as string) || "熟练",
      });
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "添加失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    setError("");
    setSaving(true);
    try {
      await updateSkill(id, {
        name: (formData.get("name") as string) || undefined,
        category: (formData.get("category") as string) || undefined,
        level: (formData.get("level") as string) || undefined,
      });
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setSaving(true);
    try {
      await deleteSkill(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  // 按分类分组
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || "其他";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">技能清单</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> 添加
        </button>
      </div>

      {error && (
        <p className="mb-3 text-sm text-[var(--destructive)]">{error}</p>
      )}

      {/* 技能列表 */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, catSkills]) => (
          <div key={category}>
            <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {catSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="group flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--secondary)] px-3 py-1 text-sm"
                >
                  {skill.name}
                  <span className="text-xs text-[var(--muted-foreground)]">
                    ({skill.level})
                  </span>
                  <button
                    onClick={() => setEditingId(editingId === skill.id ? null : skill.id)}
                    className="ml-1 hidden text-[var(--muted-foreground)] hover:text-[var(--primary)] group-hover:inline"
                    title="编辑"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="hidden text-[var(--muted-foreground)] hover:text-[var(--destructive)] group-hover:inline"
                    title="删除"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {/* 技能编辑表单 */}
            {catSkills.map((skill) =>
              editingId === skill.id ? (
                <form
                  key={`edit-${skill.id}`}
                  action={(formData: FormData) => handleUpdate(skill.id, formData)}
                  className="mt-2 flex flex-wrap items-end gap-3 rounded-md border border-[var(--border)] p-3"
                >
                  <div>
                    <label className="mb-1 block text-xs font-medium">技能名称 *</label>
                    <input
                      name="name"
                      required
                      defaultValue={skill.name}
                      className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">分类 *</label>
                    <select
                      name="category"
                      required
                      defaultValue={skill.category}
                      className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    >
                      <option value="编程语言">编程语言</option>
                      <option value="前端框架">前端框架</option>
                      <option value="后端框架">后端框架</option>
                      <option value="数据库">数据库</option>
                      <option value="工具">工具</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">熟练度 *</label>
                    <select
                      name="level"
                      required
                      defaultValue={skill.level}
                      className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    >
                      <option value="精通">精通</option>
                      <option value="熟练">熟练</option>
                      <option value="熟悉">熟悉</option>
                      <option value="了解">了解</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--accent)]"
                  >
                    取消
                  </button>
                </form>
              ) : null
            )}
          </div>
        ))}
        {skills.length === 0 && !showForm && (
          <p className="text-sm text-[var(--muted-foreground)]">
            暂无技能，点击"添加"按钮新增
          </p>
        )}
      </div>

      {/* 添加表单 */}
      {showForm && (
        <form
          action={handleAdd}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-[var(--border)] p-4"
        >
          <div>
            <label className="mb-1 block text-xs font-medium">技能名称 *</label>
            <input
              name="name"
              required
              placeholder="如：React"
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">分类 *</label>
            <select
              name="category"
              required
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">选择分类</option>
              <option value="编程语言">编程语言</option>
              <option value="前端框架">前端框架</option>
              <option value="后端框架">后端框架</option>
              <option value="数据库">数据库</option>
              <option value="工具">工具</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">熟练度 *</label>
            <select
              name="level"
              required
              className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">选择熟练度</option>
              <option value="精通">精通</option>
              <option value="熟练">熟练</option>
              <option value="熟悉">熟悉</option>
              <option value="了解">了解</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "..." : "添加"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]"
          >
            取消
          </button>
        </form>
      )}
    </section>
  );
}
