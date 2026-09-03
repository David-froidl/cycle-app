"use server";

import { revalidatePath } from "next/cache";
import { getAssignment } from "@/lib/assignments";
import { triggerLearningPlanForExam } from "@/lib/learningPlan";

export async function regenerateLearningPlanAction(examId: string): Promise<void> {
  const exam = await getAssignment(examId);
  if (!exam) throw new Error("Prüfungseintrag nicht gefunden");
  await triggerLearningPlanForExam(exam);
  revalidatePath("/");
  revalidatePath("/abgaben");
  revalidatePath(`/lernplan/${examId}`);
}
