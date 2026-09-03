import type { EveningEntry } from "@/lib/types";
import { formatDayLabel } from "@/lib/date";

export function EveningHistory({ entries }: { entries: EveningEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="border-t border-line pt-8">
      <h2 className="mb-4 text-sm font-medium text-text-dim">Verlauf</h2>
      <ul className="divide-y divide-line">
        {entries.map((entry) => (
          <li key={entry.id} className="py-4 first:pt-0">
            <p className="text-xs text-text-dim">{formatDayLabel(entry.date)}</p>
            {entry.dayDone && <p className="mt-1 text-sm text-text">{entry.dayDone}</p>}
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
