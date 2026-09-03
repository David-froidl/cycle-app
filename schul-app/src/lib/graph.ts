import "server-only";
import { getValue, setValue } from "./storage";
import type { GraphTokens } from "./types";

const TENANT = process.env.MS_TENANT_ID ?? "common";
const CLIENT_ID = process.env.MS_CLIENT_ID;
const CLIENT_SECRET = process.env.MS_CLIENT_SECRET;
const REDIRECT_URI = process.env.MS_REDIRECT_URI;

const SCOPES = [
  "offline_access",
  "ChannelMessage.Read.All",
  "Files.Read.All",
  "Team.ReadBasic.All",
  "Channel.ReadBasic.All",
].join(" ");

const TOKENS_KEY = "graphTokens";
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export function isGraphConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI);
}

export function buildAuthorizeUrl(state: string): string {
  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error("MS_CLIENT_ID/MS_REDIRECT_URI sind nicht gesetzt");
  }
  const url = new URL(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`,
  );
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

export async function exchangeCodeForTokens(code: string): Promise<GraphTokens> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("Microsoft Graph ist nicht konfiguriert");
  }
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    code,
    scope: SCOPES,
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      cache: "no-store",
    },
  );
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || !data.access_token || !data.refresh_token) {
    throw new Error(data.error_description ?? "Token-Austausch fehlgeschlagen");
  }

  const tokens: GraphTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
  await setValue(TOKENS_KEY, tokens);
  return tokens;
}

async function refreshTokens(refreshToken: string): Promise<GraphTokens> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Microsoft Graph ist nicht konfiguriert");
  }
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: SCOPES,
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      cache: "no-store",
    },
  );
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? "Token-Erneuerung fehlgeschlagen");
  }

  const tokens: GraphTokens = {
    accessToken: data.access_token,
    // Microsoft rotates refresh tokens on most tenants; fall back to the old
    // one if a new one isn't issued.
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
  await setValue(TOKENS_KEY, tokens);
  return tokens;
}

export async function isGraphConnected(): Promise<boolean> {
  const tokens = await getValue<GraphTokens>(TOKENS_KEY);
  return Boolean(tokens?.refreshToken);
}

async function getAccessToken(): Promise<string> {
  const tokens = await getValue<GraphTokens>(TOKENS_KEY);
  if (!tokens) {
    throw new Error("Microsoft Teams ist nicht verbunden");
  }
  const EXPIRY_MARGIN_MS = 60_000;
  if (Date.now() < tokens.expiresAt - EXPIRY_MARGIN_MS) {
    return tokens.accessToken;
  }
  const refreshed = await refreshTokens(tokens.refreshToken);
  return refreshed.accessToken;
}

async function graphFetch<T>(pathOrUrl: string): Promise<T> {
  const token = await getAccessToken();
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${GRAPH_BASE}${pathOrUrl}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Graph API ${res.status}: ${body}`);
  }
  return (await res.json()) as T;
}

export interface GraphTeam {
  id: string;
  displayName: string;
}

export interface GraphChannel {
  id: string;
  displayName: string;
}

export async function listJoinedTeams(): Promise<GraphTeam[]> {
  const data = await graphFetch<{ value: GraphTeam[] }>("/me/joinedTeams");
  return data.value;
}

export async function listChannels(teamId: string): Promise<GraphChannel[]> {
  const data = await graphFetch<{ value: GraphChannel[] }>(
    `/teams/${teamId}/channels`,
  );
  return data.value;
}

export interface GraphAttachment {
  id: string;
  name?: string;
  contentType?: string;
  contentUrl?: string;
}

export interface GraphChannelMessage {
  id: string;
  createdDateTime: string;
  body: { contentType: string; content: string };
  attachments?: GraphAttachment[];
}

export async function fetchChannelMessagesSince(
  teamId: string,
  channelId: string,
  since: Date,
): Promise<GraphChannelMessage[]> {
  const messages: GraphChannelMessage[] = [];
  let url: string | undefined = `/teams/${teamId}/channels/${channelId}/messages?$top=50`;

  // The channel messages endpoint doesn't support server-side date filtering,
  // so page through and stop once we're past the window we care about.
  while (url) {
    const data: { value: GraphChannelMessage[]; "@odata.nextLink"?: string } =
      await graphFetch(url);
    let hitOlderMessage = false;
    for (const message of data.value) {
      if (new Date(message.createdDateTime) < since) {
        hitOlderMessage = true;
        continue;
      }
      messages.push(message);
    }
    url = hitOlderMessage ? undefined : data["@odata.nextLink"];
  }

  return messages;
}

function toSharingToken(shareUrl: string): string {
  const base64 = Buffer.from(shareUrl, "utf-8")
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\//g, "_")
    .replace(/\+/g, "-");
  return `u!${base64}`;
}

export async function downloadSharedFile(
  contentUrl: string,
): Promise<Buffer | null> {
  try {
    const token = await getAccessToken();
    const shareId = toSharingToken(contentUrl);
    const metaRes = await fetch(
      `${GRAPH_BASE}/shares/${shareId}/driveItem`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    if (!metaRes.ok) return null;
    const meta = (await metaRes.json()) as { id: string; parentReference?: { driveId?: string } };
    const driveId = meta.parentReference?.driveId;
    const downloadUrl = driveId
      ? `${GRAPH_BASE}/drives/${driveId}/items/${meta.id}/content`
      : `${GRAPH_BASE}/shares/${shareId}/driveItem/content`;

    const fileRes = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!fileRes.ok) return null;
    const arrayBuffer = await fileRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}
