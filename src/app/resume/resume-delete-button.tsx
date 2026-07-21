"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteResume } from "./actions";

export function ResumeDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确定要删除这份简历吗？关联的投递记录也会被删除。")) return;
    startTransition(async () => {
      await deleteResume(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] disabled:opacity-50"
      title="删除简历"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
