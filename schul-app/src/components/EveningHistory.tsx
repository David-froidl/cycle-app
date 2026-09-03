import type { EveningEntry } from "@/lib/types";
import { formatDayLabel } from "@/lib/date";

export function EveningHistory({ entries }: { entries: EveningEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-text-dim">Verlauf</h2>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-md border border-line bg-surface/60 p-3">
            <p className="text-xs text-text-faint">{formatDayLabel(entry.date)}</p>
            {entry.dayDone && <p className="mt-1 text-sm text-text-dim">{entry.dayDone}</p>}
            {entry.openItems && (
              <p className="mt-1 text-sm text-text-dim">Offen: {entry.openItems}</p>
            )}
            {entry.tomorrowLearning && (
              <p className="mt-1 text-sm text-text-dim">
                Morgen lernen: {entry.tomorrowLearning}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
