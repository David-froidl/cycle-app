import Link from "next/link";
import type { AssignmentEntry } from "@/lib/types";
import { formatShortDate, isPast } from "@/lib/date";

export function AssignmentsPreview({ items }: { items: AssignmentEntry[] }) {
  const open = items.filter((a) => !a.done).slice(0, 5);

  return (
    <section className="border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">Offene Abgaben</h2>
        <Link href="/abgaben" className="text-xs text-text-dim underline underline-offset-4 hover:text-text">
          Alle ansehen
        </Link>
      </div>
      {open.length === 0 ? (
        <p className="mt-2 text-sm text-text-dim">Nichts offen.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {open.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-text">{a.title}</p>
                <p className="text-xs text-text-dim">{a.subject}</p>
              </div>
              <span
                className={`shrink-0 text-xs tabular-nums ${
                  isPast(a.dueDate) ? "text-danger" : "text-text-dim"
                }`}
              >
                {formatShortDate(a.dueDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
