import type { LearningBlock } from "@/lib/types";
import { formatDayLabel } from "@/lib/date";

export function LearningTimeline({ blocks }: { blocks: LearningBlock[] }) {
  if (blocks.length === 0) {
    return <p className="text-sm text-text-dim">Noch keine Lernblöcke.</p>;
  }

  return (
    <ol className="space-y-0">
      {blocks.map((block, i) => (
        <li key={i} className="flex gap-4 border-l border-line pb-6 pl-4 last:pb-0">
          <div className="-ml-[21px] mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-bg bg-accent" />
          <div className="-mt-1">
            <p className="text-xs text-text-dim">{formatDayLabel(block.date)}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-sm font-medium text-text">{block.title}</p>
              {block.kind === "wiederholung" && (
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] text-text-dim">
                  Wiederholung
                </span>
              )}
            </div>
            {block.description && (
              <p className="mt-1 text-sm text-text-dim">{block.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
