import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssignment } from "@/lib/assignments";
import { getLearningPlanForExam } from "@/lib/learningPlan";
import { regenerateLearningPlanAction } from "@/app/actions/learningPlan";
import { LearningTimeline } from "@/components/LearningTimeline";

export const dynamic = "force-dynamic";

export default async function LearningPlanPage(
  props: PageProps<"/lernplan/[examId]">,
) {
  const { examId } = await props.params;

  const [exam, plan] = await Promise.all([
    getAssignment(examId),
    getLearningPlanForExam(examId),
  ]);

  if (!exam) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link href="/abgaben" className="text-xs text-text-dim underline underline-offset-2">
          ← Abgaben &amp; Prüfungen
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-text">
          {exam.subject} · {exam.title}
        </h1>
        <p className="text-sm text-text-dim">Prüfung am {exam.dueDate}</p>
      </div>

      {!plan && (
        <p className="rounded-md border border-line bg-surface p-4 text-sm text-text-dim">
          Noch kein Lernplan vorhanden.
        </p>
      )}

      {plan?.status === "pending" && (
        <p className="rounded-md border border-line bg-surface p-4 text-sm text-text-dim">
          Lernplan wird erstellt…
        </p>
      )}

      {plan?.status === "error" && (
        <div className="rounded-md border border-danger/30 bg-danger-soft p-4">
          <p className="text-sm text-danger">Lernplan konnte nicht erstellt werden.</p>
          {plan.error && <p className="mt-1 text-xs text-danger/80">{plan.error}</p>}
        </div>
      )}

      {plan?.status === "ready" && (
        <div className="rounded-md border border-line bg-surface p-4">
          {plan.contentSourceNote && (
            <p className="mb-4 text-xs text-text-faint">{plan.contentSourceNote}</p>
          )}
          <LearningTimeline blocks={plan.blocks} />
        </div>
      )}

      <form action={regenerateLearningPlanAction.bind(null, examId)}>
        <button
          type="submit"
          className="rounded-md border border-line px-3 py-1.5 text-xs text-text-dim hover:border-accent hover:text-accent"
        >
          Lernplan neu erstellen
        </button>
      </form>
    </div>
  );
}
