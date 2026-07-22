"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteParsedJD } from "@/lib/services/jd";

export function JDDeleteButton({ id }: { id: string }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确定要删除这条 JD 记录吗？关联的简历也会被删除。")) return;
    setError("");
    setSaving(true);
    try {
      await deleteParsedJD(id);
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
        title="删除 JD"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && <span className="text-xs text-[var(--destructive)]">{error}</span>}
    </span>
  );
}
