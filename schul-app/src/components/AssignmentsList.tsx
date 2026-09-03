import { AssignmentRow } from "@/components/AssignmentRow";
import type { AssignmentEntry, LearningPlanStatus } from "@/lib/types";
import { sortByUrgency } from "@/lib/assignments";

export function AssignmentsList({
  items,
  planStatusByExamId,
}: {
  items: AssignmentEntry[];
  planStatusByExamId: Record<string, LearningPlanStatus>;
}) {
  const sorted = sortByUrgency(items);
  const open = sorted.filter((a) => !a.done);
  const done = sorted.filter((a) => a.done);

  return (
    <div className="border border-line bg-surface p-5">
      {open.length === 0 ? (
        <p className="py-2 text-sm text-text-dim">Nichts offen.</p>
      ) : (
        <ul className="divide-y divide-line">
          {open.map((entry) => (
            <AssignmentRow
              key={entry.id}
              entry={entry}
              planStatus={planStatusByExamId[entry.id]}
            />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <details className="mt-4 border-t border-line pt-4">
          <summary className="cursor-pointer text-xs text-text-dim hover:text-text">
            Erledigt ({done.length})
          </summary>
          <ul className="mt-2 divide-y divide-line">
            {done.map((entry) => (
              <AssignmentRow
                key={entry.id}
                entry={entry}
                planStatus={planStatusByExamId[entry.id]}
              />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
