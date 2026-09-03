import type { DayTimetable, TimetableLesson } from "@/lib/types";
import type { TodayLearningItem } from "@/lib/learningPlan";

function LessonRow({ lesson }: { lesson: TimetableLesson }) {
  return (
    <li
      className={`flex items-baseline justify-between gap-3 py-2.5 ${
        lesson.cancelled ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-baseline gap-3">
        <span className="w-11 shrink-0 text-xs tabular-nums text-text-faint">
          {lesson.startTime}
        </span>
        <div>
          <p className={`text-sm ${lesson.cancelled ? "line-through" : "text-text"}`}>
            {lesson.subject}
          </p>
          <p className="text-xs text-text-dim">
            {lesson.cancelled
              ? "Entfällt"
              : [lesson.room, lesson.teacher].filter(Boolean).join(" · ")}
            {lesson.roomChanged && !lesson.cancelled && (
              <span className="ml-1 text-accent">
                (statt {lesson.originalRoom})
              </span>
            )}
          </p>
        </div>
      </div>
      {lesson.cancelled && (
        <span className="shrink-0 rounded-full bg-danger-soft px-2 py-0.5 text-[0.7rem] font-medium text-danger">
          Entfall
        </span>
      )}
      {!lesson.cancelled && lesson.roomChanged && (
        <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[0.7rem] font-medium text-accent">
          Raum geändert
        </span>
      )}
    </li>
  );
}

export function TimetableCard({
  day,
  nextLearningItem,
}: {
  day: DayTimetable | undefined;
  nextLearningItem: TodayLearningItem | null;
}) {
  if (!day || day.lessons.length === 0) {
    return (
      <section className="rounded-md border border-line bg-surface p-4">
        <h2 className="text-sm font-medium text-text">Stundenplan</h2>
        <p className="mt-2 text-sm text-text-dim">
          Heute stehen keine Stunden im Plan.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">Stundenplan heute</h2>
        {day.isLongDay && (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.7rem] text-text-dim">
            Langer Schultag · {day.lessonCount} Stunden
          </span>
        )}
      </div>
      <ul className="mt-1 divide-y divide-line">
        {day.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} />
        ))}
      </ul>
      {day.freePeriods.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-line pt-3">
          {day.freePeriods.map((fp) => (
            <p key={fp.afterIndex} className="text-xs text-text-dim">
              Freistunde {fp.startTime}–{fp.endTime}
              {nextLearningItem && (
                <>
                  {" "}
                  — Zeit für &quot;{nextLearningItem.block.title}&quot; (
                  {nextLearningItem.subject})?
                </>
              )}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
