import type { DayTimetable, FreePeriod, TimetableLesson } from "./types";

// A day counts as "long" once this many periods are actually held.
const LONG_DAY_THRESHOLD = 7;

export function groupByDay(lessons: TimetableLesson[]): DayTimetable[] {
  const byDate = new Map<string, TimetableLesson[]>();
  for (const lesson of lessons) {
    const bucket = byDate.get(lesson.date);
    if (bucket) bucket.push(lesson);
    else byDate.set(lesson.date, [lesson]);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayLessons]) => {
      const sorted = [...dayLessons].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      const active = sorted.filter((l) => !l.cancelled);

      const freePeriods: FreePeriod[] = [];
      for (let i = 0; i < active.length - 1; i++) {
        if (active[i].endTime < active[i + 1].startTime) {
          freePeriods.push({
            afterIndex: i,
            startTime: active[i].endTime,
            endTime: active[i + 1].startTime,
          });
        }
      }

      return {
        date,
        lessons: sorted,
        freePeriods,
        isLongDay: active.length >= LONG_DAY_THRESHOLD,
        lessonCount: active.length,
      } satisfies DayTimetable;
    });
}

export function findDay(days: DayTimetable[], iso: string): DayTimetable | undefined {
  return days.find((d) => d.date === iso);
}
