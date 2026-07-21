"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteParsedJD } from "./actions";

export function JDDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确定要删除这条 JD 记录吗？关联的简历也会被删除。")) return;
    startTransition(async () => {
      await deleteParsedJD(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] disabled:opacity-50"
      title="删除 JD"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
