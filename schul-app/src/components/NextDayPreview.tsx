import type { DayTimetable } from "@/lib/types";
import { formatDayLabel } from "@/lib/date";

export function NextDayPreview({ day }: { day: DayTimetable | undefined }) {
  if (!day) return null;
  const active = day.lessons.filter((l) => !l.cancelled);
  const cancelledCount = day.lessons.length - active.length;

  return (
    <section className="border-t border-line pt-6">
      <h2 className="text-sm font-medium text-text-dim">
        Nächster Schultag · {formatDayLabel(day.date)}
      </h2>
      <p className="mt-1 text-sm text-text-dim">
        {active.length} Stunden
        {day.isLongDay ? ", langer Tag" : ""}
        {cancelledCount > 0 ? `, ${cancelledCount} Entfall(e)` : ""}
        {active[0] ? ` · Beginn ${active[0].startTime} (${active[0].subject})` : ""}
      </p>
    </section>
  );
}
