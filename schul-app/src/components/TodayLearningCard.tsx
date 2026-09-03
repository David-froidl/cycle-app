import Link from "next/link";
import type { TodayLearningItem } from "@/lib/learningPlan";
import type { EveningEntry } from "@/lib/types";

export function TodayLearningCard({
  items,
  fallbackEntry,
}: {
  items: TodayLearningItem[];
  fallbackEntry: EveningEntry | null;
}) {
  if (items.length > 0) {
    return (
      <section className="rounded-md border border-accent/30 bg-accent-soft p-4">
        <h2 className="text-sm font-medium text-text">Heute lernen</h2>
        <ul className="mt-2 space-y-3">
          {items.map((item, i) => (
            <li key={i}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text">{item.block.title}</p>
                {item.block.kind === "wiederholung" && (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] text-text-dim">
                    Wiederholung
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-text-dim">
                {item.subject} · Prüfung am {item.examDate}
              </p>
              {item.block.description && (
                <p className="mt-1 text-sm text-text-dim">{item.block.description}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (fallbackEntry?.tomorrowLearning) {
    return (
      <section className="rounded-md border border-line bg-surface p-4">
        <h2 className="text-sm font-medium text-text">Heute lernen</h2>
        <p className="mt-2 text-sm text-text-dim">{fallbackEntry.tomorrowLearning}</p>
        <p className="mt-1 text-xs text-text-faint">
          Aus deinem Abend-Eintrag vom {fallbackEntry.date}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <h2 className="text-sm font-medium text-text">Heute lernen</h2>
      <p className="mt-2 text-sm text-text-dim">
        Kein aktiver Punkt.{" "}
        <Link href="/abgaben" className="text-accent underline underline-offset-2">
          Prüfung eintragen
        </Link>{" "}
        oder abends kurz notieren, was ansteht.
      </p>
    </section>
  );
}
