import { NextResponse } from "next/server";
import { getLearningPlanForExam } from "@/lib/learningPlan";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/learning-plan/[examId]">,
) {
  const { examId } = await ctx.params;
  const plan = await getLearningPlanForExam(examId);
  if (!plan) {
    return NextResponse.json({ error: "Kein Lernplan gefunden" }, { status: 404 });
  }
  return NextResponse.json({ plan });
}
