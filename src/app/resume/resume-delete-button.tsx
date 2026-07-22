"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteResume } from "@/lib/services/resume";

export function ResumeDeleteButton({ id }: { id: string }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确定要删除这份简历吗？关联的投递记录也会被删除。")) return;
    setError("");
    setSaving(true);
    try {
      await deleteResume(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={handleDelete}
        disabled={saving}
        className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] disabled:opacity-50"
        title="删除简历"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && <span className="text-xs text-[var(--destructive)]">{error}</span>}
    </span>
  );
}
