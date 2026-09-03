import Link from "next/link";
import { fetchUpcomingTimetable, isUntisConfigured } from "@/lib/untis";
import { groupByDay, findDay } from "@/lib/schedule";
import { listAssignments, sortByUrgency } from "@/lib/assignments";
import {
  getTodayLearningItems,
  getNextUpcomingLearningItem,
} from "@/lib/learningPlan";
import { getLatestEveningEntry } from "@/lib/evening";
import { todayISO } from "@/lib/date";
import { TimetableCard } from "@/components/TimetableCard";
import { TodayLearningCard } from "@/components/TodayLearningCard";
import { AssignmentsPreview } from "@/components/AssignmentsPreview";
import { NextDayPreview } from "@/components/NextDayPreview";

export const dynamic = "force-dynamic";

export default async function MorningPage() {
  const today = todayISO();

  const [assignments, todayLearningItems, nextLearningItem, latestEvening] =
    await Promise.all([
      listAssignments(),
      getTodayLearningItems(),
      getNextUpcomingLearningItem(),
      getLatestEveningEntry(),
    ]);

  let timetableError: string | null = null;
  let days: ReturnType<typeof groupByDay> = [];
  if (isUntisConfigured()) {
    try {
      const lessons = await fetchUpcomingTimetable(8);
      days = groupByDay(lessons);
    } catch (err) {
      timetableError = err instanceof Error ? err.message : "Unbekannter Fehler";
    }
  }

  const todayDay = findDay(days, today);
  const nextSchoolDay = days.find((d) => d.date > today && d.lessons.some((l) => !l.cancelled));

  return (
    <div className="space-y-4">
      <TodayLearningCard items={todayLearningItems} fallbackEntry={latestEvening} />

      {!isUntisConfigured() && (
        <p className="rounded-md border border-line bg-surface p-4 text-sm text-text-dim">
          WebUntis ist noch nicht eingerichtet.{" "}
          <Link href="/einstellungen" className="text-accent underline underline-offset-2">
            Zugangsdaten hinterlegen
          </Link>
          .
        </p>
      )}
      {timetableError && (
        <p className="rounded-md border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          Stundenplan konnte nicht geladen werden: {timetableError}
        </p>
      )}
      {isUntisConfigured() && !timetableError && (
        <TimetableCard day={todayDay} nextLearningItem={nextLearningItem} />
      )}

      <AssignmentsPreview items={sortByUrgency(assignments)} />

      <NextDayPreview day={nextSchoolDay} />
    </div>
  );
}
