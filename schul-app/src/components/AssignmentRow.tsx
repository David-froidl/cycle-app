"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  deleteAssignmentAction,
  toggleAssignmentAction,
} from "@/app/actions/assignments";
import type { AssignmentEntry, LearningPlanStatus } from "@/lib/types";
import { formatShortDate, isPast } from "@/lib/date";
import { Tag } from "@/components/Tag";

const STATUS_LABEL: Record<LearningPlanStatus, string> = {
  ready: "Lernplan bereit",
  pending: "Lernplan wird erstellt…",
  error: "Lernplan fehlgeschlagen",
};

export function AssignmentRow({
  entry,
  planStatus,
}: {
  entry: AssignmentEntry;
  planStatus?: LearningPlanStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className={`flex items-start gap-3 py-3 ${entry.done ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={entry.done}
        disabled={isPending}
        onChange={(e) => {
          const done = e.target.checked;
          startTransition(() => toggleAssignmentAction(entry.id, done));
        }}
        className="mt-1 accent-accent"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={`text-sm text-text ${entry.done ? "line-through" : ""}`}>
            {entry.title}
          </p>
          {entry.type === "pruefung" && <Tag tone="accent">Prüfung</Tag>}
        </div>
        <p className="text-xs text-text-dim">
          {entry.subject} ·{" "}
          <span className={isPast(entry.dueDate) && !entry.done ? "text-danger" : ""}>
            {formatShortDate(entry.dueDate)}
          </span>
        </p>
        {entry.note && <p className="mt-1 text-xs text-text-dim">{entry.note}</p>}
        {entry.type === "pruefung" && planStatus && (
          <Link
            href={`/lernplan/${entry.id}`}
            className="mt-1 inline-block text-xs text-accent underline underline-offset-4"
          >
            {STATUS_LABEL[planStatus]}
          </Link>
        )}
      </div>
      <button
        onClick={() => startTransition(() => deleteAssignmentAction(entry.id))}
        disabled={isPending}
        className="text-xs text-text-dim hover:text-danger"
        aria-label="Löschen"
      >
        Löschen
      </button>
    </li>
  );
}
