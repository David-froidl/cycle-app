import { listAssignments } from "@/lib/assignments";
import { listLearningPlans } from "@/lib/learningPlan";
import { AssignmentForm } from "@/components/AssignmentForm";
import { AssignmentsList } from "@/components/AssignmentsList";
import type { LearningPlanStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AbgabenPage() {
  const [assignments, plans] = await Promise.all([
    listAssignments(),
    listLearningPlans(),
  ]);

  const planStatusByExamId: Record<string, LearningPlanStatus> = {};
  for (const plan of plans) {
    planStatusByExamId[plan.examId] = plan.status;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-text">Abgaben &amp; Prüfungen</h1>
      <AssignmentForm />
      <AssignmentsList items={assignments} planStatusByExamId={planStatusByExamId} />
    </div>
  );
}
