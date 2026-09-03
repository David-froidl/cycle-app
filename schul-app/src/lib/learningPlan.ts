import "server-only";
import { randomUUID } from "crypto";
import { getValue, setValue } from "./storage";
import type { AssignmentEntry, LearningBlock, LearningPlan } from "./types";
import { getSubjectContent } from "./teamsContent";
import { generateLearningPlan as callLlm } from "./llm";
import { fetchUpcomingTimetable, isUntisConfigured } from "./untis";
import { groupByDay } from "./schedule";
import { listAssignments } from "./assignments";
import { daysBetween, todayISO } from "./date";

const KEY = "learningPlans";

export async function listLearningPlans(): Promise<LearningPlan[]> {
  return (await getValue<LearningPlan[]>(KEY)) ?? [];
}

export async function getLearningPlanForExam(
  examId: string,
): Promise<LearningPlan | null> {
  const all = await listLearningPlans();
  return all.find((p) => p.examId === examId) ?? null;
}

async function savePlan(plan: LearningPlan): Promise<void> {
  const all = await listLearningPlans();
  const filtered = all.filter((p) => p.examId !== plan.examId);
  filtered.push(plan);
  await setValue(KEY, filtered);
}

/**
 * Runs the full learning-plan pipeline for a newly created exam entry:
 * Teams content -> timetable -> LLM -> stored plan. Never throws — failures
 * are recorded on the plan itself so the UI can show what went wrong instead
 * of silently dropping the exam entry.
 */
export async function triggerLearningPlanForExam(
  exam: AssignmentEntry,
): Promise<void> {
  const pendingPlan: LearningPlan = {
    id: randomUUID(),
    examId: exam.id,
    subject: exam.subject,
    examDate: exam.dueDate,
    createdAt: new Date().toISOString(),
    status: "pending",
    blocks: [],
  };
  await savePlan(pendingPlan);

  try {
    const daysAhead = Math.max(daysBetween(todayISO(), exam.dueDate) + 1, 1);
    const [{ text: contentText, sourceNote }, upcomingLessons, allAssignments] =
      await Promise.all([
        getSubjectContent(exam.subject).catch((err: unknown) => ({
          text: "",
          sourceNote: `Teams-Inhalte konnten nicht geladen werden: ${
            err instanceof Error ? err.message : String(err)
          }`,
        })),
        isUntisConfigured()
          ? fetchUpcomingTimetable(daysAhead).catch(() => [])
          : Promise.resolve([]),
        listAssignments(),
      ]);

    const days = groupByDay(upcomingLessons);
    const blocks: LearningBlock[] = await callLlm({
      subject: exam.subject,
      examDate: exam.dueDate,
      contentText,
      contentSourceNote: sourceNote,
      days,
      otherAssignments: allAssignments.filter(
        (a) => a.id !== exam.id && !a.done,
      ),
    });

    await savePlan({
      ...pendingPlan,
      status: "ready",
      blocks,
      contentSourceNote: sourceNote,
    });
  } catch (err) {
    await savePlan({
      ...pendingPlan,
      status: "error",
      error: err instanceof Error ? err.message : "Unbekannter Fehler",
    });
  }
}

export interface TodayLearningItem {
  subject: string;
  examDate: string;
  block: LearningBlock;
}

export async function getTodayLearningItems(): Promise<TodayLearningItem[]> {
  const today = todayISO();
  const plans = await listLearningPlans();
  const items: TodayLearningItem[] = [];
  for (const plan of plans) {
    if (plan.status !== "ready") continue;
    for (const block of plan.blocks) {
      if (block.date === today) {
        items.push({ subject: plan.subject, examDate: plan.examDate, block });
      }
    }
  }
  return items;
}

export async function hasActiveLearningPlan(): Promise<boolean> {
  const today = todayISO();
  const plans = await listLearningPlans();
  return plans.some((p) => p.status === "ready" && p.examDate >= today);
}

/** Soonest not-yet-due learning block, for a free-period "move it up" hint. */
export async function getNextUpcomingLearningItem(): Promise<TodayLearningItem | null> {
  const today = todayISO();
  const plans = await listLearningPlans();
  const items: TodayLearningItem[] = [];
  for (const plan of plans) {
    if (plan.status !== "ready") continue;
    for (const block of plan.blocks) {
      if (block.date > today) {
        items.push({ subject: plan.subject, examDate: plan.examDate, block });
      }
    }
  }
  items.sort((a, b) => a.block.date.localeCompare(b.block.date));
  return items[0] ?? null;
}
