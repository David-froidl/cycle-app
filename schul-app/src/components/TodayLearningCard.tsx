import Link from "next/link";
import type { TodayLearningItem } from "@/lib/learningPlan";
import type { EveningEntry } from "@/lib/types";
import { Tag } from "@/components/Tag";

export function TodayLearningCard({
  items,
  fallbackEntry,
}: {
  items: TodayLearningItem[];
  fallbackEntry: EveningEntry | null;
}) {
  if (items.length > 0) {
    return (
      <section className="border border-line border-l-2 border-l-accent bg-surface p-5">
        <h2 className="text-sm font-medium text-text">Heute lernen</h2>
        <ul className="mt-3 space-y-4">
          {items.map((item, i) => (
            <li key={i}>
              <div className="flex items-center gap-2">
                <p className="text-sm text-text">{item.block.title}</p>
                {item.block.kind === "wiederholung" && <Tag>Wiederholung</Tag>}
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
      <section className="border border-line bg-surface p-5">
        <h2 className="text-sm font-medium text-text">Heute lernen</h2>
        <p className="mt-2 text-sm text-text-dim">{fallbackEntry.tomorrowLearning}</p>
        <p className="mt-1 text-xs text-text-dim">
          Aus deinem Abend-Eintrag vom {fallbackEntry.date}
        </p>
      </section>
    );
  }

  return (
    <section className="border border-line bg-surface p-5">
      <h2 className="text-sm font-medium text-text">Heute lernen</h2>
      <p className="mt-2 text-sm text-text-dim">
        Kein aktiver Punkt.{" "}
        <Link href="/abgaben" className="text-accent underline underline-offset-4">
          Prüfung eintragen
        </Link>{" "}
        oder abends kurz notieren, was ansteht.
      </p>
    </section>
  );
}
