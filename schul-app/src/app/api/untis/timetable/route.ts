import { NextResponse } from "next/server";
import { fetchUpcomingTimetable } from "@/lib/untis";
import { groupByDay } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lessons = await fetchUpcomingTimetable(8);
    return NextResponse.json({ days: groupByDay(lessons) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fehler" },
      { status: 502 },
    );
  }
}
