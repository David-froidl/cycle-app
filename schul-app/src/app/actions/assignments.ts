"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  createAssignment,
  deleteAssignment,
  updateAssignment,
} from "@/lib/assignments";
import { triggerLearningPlanForExam } from "@/lib/learningPlan";
import type { AssignmentType } from "@/lib/types";

export async function createAssignmentAction(formData: FormData): Promise<void> {
  const type = formData.get("type") === "pruefung" ? "pruefung" : "abgabe";
  const subject = String(formData.get("subject") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!subject || !title || !dueDate) {
    throw new Error("Fach, Titel und Datum sind erforderlich");
  }

  const entry = await createAssignment({
    type: type as AssignmentType,
    subject,
    title,
    dueDate,
    note: note || undefined,
  });

  if (entry.type === "pruefung") {
    // Kick off the (potentially slow) LLM pipeline after this response is
    // sent, so creating the exam entry itself stays fast.
    after(() => triggerLearningPlanForExam(entry));
  }

  revalidatePath("/");
  revalidatePath("/abgaben");
}

export async function toggleAssignmentAction(
  id: string,
  done: boolean,
): Promise<void> {
  await updateAssignment(id, { done });
  revalidatePath("/");
  revalidatePath("/abgaben");
}

export async function deleteAssignmentAction(id: string): Promise<void> {
  await deleteAssignment(id);
  revalidatePath("/");
  revalidatePath("/abgaben");
}
