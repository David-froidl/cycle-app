import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens } from "@/lib/graph";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "ms_graph_oauth_state";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  const settingsUrl = new URL("/einstellungen", url.origin);

  if (error) {
    settingsUrl.searchParams.set("graph_error", error);
    return NextResponse.redirect(settingsUrl);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    settingsUrl.searchParams.set("graph_error", "Ungültige OAuth-Antwort");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    await exchangeCodeForTokens(code);
    settingsUrl.searchParams.set("graph_connected", "1");
  } catch (err) {
    settingsUrl.searchParams.set(
      "graph_error",
      err instanceof Error ? err.message : "Verbindung fehlgeschlagen",
    );
  }

  return NextResponse.redirect(settingsUrl);
}
