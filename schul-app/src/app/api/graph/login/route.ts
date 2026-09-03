import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAuthorizeUrl, isGraphConfigured } from "@/lib/graph";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "ms_graph_oauth_state";

export async function GET() {
  if (!isGraphConfigured()) {
    return NextResponse.json(
      {
        error:
          "Microsoft Graph ist nicht konfiguriert (MS_CLIENT_ID/MS_CLIENT_SECRET/MS_REDIRECT_URI fehlen)",
      },
      { status: 500 },
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
