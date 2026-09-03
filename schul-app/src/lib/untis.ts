import "server-only";
import type { TimetableLesson } from "./types";
import { toISODate } from "./date";

const UNTIS_SERVER = process.env.WEBUNTIS_SERVER ?? "htl-saalfelden.webuntis.com";
const UNTIS_SCHOOL = process.env.WEBUNTIS_SCHOOL ?? "htl-saalfelden";
const UNTIS_USERNAME = process.env.WEBUNTIS_USERNAME;
const UNTIS_PASSWORD = process.env.WEBUNTIS_PASSWORD;

export class UntisError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = "UntisError";
    this.code = code;
  }
}

interface UntisSession {
  sessionId: string;
  personId: number;
  personType: number;
  cookie: string;
}

interface RpcResponse<T> {
  id: string;
  result?: T;
  error?: { code: number; message: string };
}

// Module-scope cache: survives across requests within one warm serverless
// instance, saves a round-trip on every page load. A fresh instance simply
// re-authenticates.
let cachedSession: UntisSession | null = null;

function rpcUrl(): string {
  return `https://${UNTIS_SERVER}/WebUntis/jsonrpc.do?school=${encodeURIComponent(UNTIS_SCHOOL)}`;
}

async function rpcCall<T>(
  method: string,
  params: Record<string, unknown>,
  cookie?: string,
): Promise<{ result: T; cookie?: string }> {
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      jsonrpc: "2.0",
      method,
      params,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new UntisError(`WebUntis HTTP ${res.status}`);
  }

  const setCookie = res.headers.get("set-cookie") ?? undefined;
  const data = (await res.json()) as RpcResponse<T>;

  if (data.error) {
    throw new UntisError(data.error.message, data.error.code);
  }
  if (data.result === undefined) {
    throw new UntisError("WebUntis: leere Antwort");
  }
  return { result: data.result, cookie: setCookie };
}

async function login(): Promise<UntisSession> {
  if (!UNTIS_USERNAME || !UNTIS_PASSWORD) {
    throw new UntisError(
      "WEBUNTIS_USERNAME/WEBUNTIS_PASSWORD sind nicht gesetzt",
    );
  }
  const { result, cookie } = await rpcCall<{
    sessionId: string;
    personId: number;
    personType: number;
  }>("authenticate", {
    user: UNTIS_USERNAME,
    password: UNTIS_PASSWORD,
    client: "schul-app",
  });

  cachedSession = {
    sessionId: result.sessionId,
    personId: result.personId,
    personType: result.personType,
    cookie: cookie ?? `JSESSIONID=${result.sessionId}`,
  };
  return cachedSession;
}

async function callAuthenticated<T>(
  method: string,
  buildParams: (session: UntisSession) => Record<string, unknown>,
): Promise<T> {
  const session = cachedSession ?? (await login());
  try {
    const { result } = await rpcCall<T>(method, buildParams(session), session.cookie);
    return result;
  } catch {
    // Session likely expired server-side — re-authenticate once and retry.
    const freshSession = await login();
    const { result } = await rpcCall<T>(method, buildParams(freshSession), freshSession.cookie);
    return result;
  }
}

function formatUntisDate(d: Date): number {
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate(),
    ).padStart(2, "0")}`,
  );
}

function untisTimeToHHmm(t: number): string {
  const s = String(t).padStart(4, "0");
  return `${s.slice(0, 2)}:${s.slice(2)}`;
}

function untisDateToISO(d: number): string {
  const s = String(d);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

interface RawTimetableEntity {
  id: number;
  name: string;
  longname?: string;
  orgname?: string;
}

interface RawPeriod {
  id: number;
  date: number;
  startTime: number;
  endTime: number;
  code?: "cancelled" | "irregular";
  lstext?: string;
  substText?: string;
  info?: string;
  su?: RawTimetableEntity[];
  te?: RawTimetableEntity[];
  ro?: RawTimetableEntity[];
}

function mapPeriod(p: RawPeriod): TimetableLesson {
  const subject = p.su?.[0]?.longname || p.su?.[0]?.name || "Unbekannt";
  const room = p.ro?.[0]?.name;
  const originalRoom = p.ro?.[0]?.orgname;
  const teacher = p.te?.[0]?.longname || p.te?.[0]?.name;
  const roomChanged = Boolean(
    originalRoom && room && originalRoom !== room,
  );

  return {
    id: String(p.id),
    date: untisDateToISO(p.date),
    startTime: untisTimeToHHmm(p.startTime),
    endTime: untisTimeToHHmm(p.endTime),
    subject,
    room,
    teacher,
    cancelled: p.code === "cancelled",
    roomChanged,
    originalRoom: roomChanged ? originalRoom : undefined,
    note: p.substText || p.info || (p.code === "irregular" ? p.lstext : undefined),
  };
}

export async function fetchTimetable(
  startDate: Date,
  endDate: Date,
): Promise<TimetableLesson[]> {
  const periods = await callAuthenticated<RawPeriod[]>("getTimetable", (session) => ({
    id: session.personId,
    type: session.personType,
    startDate: formatUntisDate(startDate),
    endDate: formatUntisDate(endDate),
  }));

  return periods
    .map(mapPeriod)
    .sort((a, b) =>
      a.date === b.date
        ? a.startTime.localeCompare(b.startTime)
        : a.date.localeCompare(b.date),
    );
}

export async function fetchUpcomingTimetable(days: number): Promise<TimetableLesson[]> {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  return fetchTimetable(start, end);
}

export function isUntisConfigured(): boolean {
  return Boolean(UNTIS_USERNAME && UNTIS_PASSWORD);
}

export { toISODate };
