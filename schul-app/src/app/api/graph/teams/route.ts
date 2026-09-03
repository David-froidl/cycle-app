import { NextResponse } from "next/server";
import { listJoinedTeams } from "@/lib/graph";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const teams = await listJoinedTeams();
    return NextResponse.json({ teams });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fehler" },
      { status: 502 },
    );
  }
}
