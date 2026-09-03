import { NextResponse } from "next/server";
import { listChannels } from "@/lib/graph";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/graph/teams/[teamId]/channels">,
) {
  const { teamId } = await ctx.params;
  try {
    const channels = await listChannels(teamId);
    return NextResponse.json({ channels });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fehler" },
      { status: 502 },
    );
  }
}
