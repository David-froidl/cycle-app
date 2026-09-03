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
    <div className="space-y-10">
      <div>
        <Link href="/abgaben" className="text-xs text-text-dim hover:text-text">
          ← Abgaben &amp; Prüfungen
        </Link>
        <h1 className="mt-3 text-lg font-medium text-text">
          {exam.subject} · {exam.title}
        </h1>
        <p className="text-sm text-text-dim">Prüfung am {exam.dueDate}</p>
      </div>

      {!plan && (
        <p className="border border-line bg-surface p-5 text-sm text-text-dim">
          Noch kein Lernplan vorhanden.
        </p>
      )}

      {plan?.status === "pending" && (
        <p className="border border-line bg-surface p-5 text-sm text-text-dim">
          Lernplan wird erstellt…
        </p>
      )}

      {plan?.status === "error" && (
        <div className="border border-danger/40 p-5">
          <p className="text-sm text-danger">Lernplan konnte nicht erstellt werden.</p>
          {plan.error && <p className="mt-1 text-xs text-danger/70">{plan.error}</p>}
        </div>
      )}

      {plan?.status === "ready" && (
        <div className="border border-line bg-surface p-5">
          {plan.contentSourceNote && (
            <p className="mb-5 text-xs text-text-dim">{plan.contentSourceNote}</p>
          )}
          <LearningTimeline blocks={plan.blocks} />
        </div>
      )}

      <form action={regenerateLearningPlanAction.bind(null, examId)}>
        <button
          type="submit"
          className="text-xs text-text-dim underline underline-offset-4 hover:text-accent"
        >
          Lernplan neu erstellen
        </button>
      </form>
    </div>
  );
}
