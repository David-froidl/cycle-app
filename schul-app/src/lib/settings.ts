import "server-only";
import { getValue, setValue } from "./storage";
import { DEFAULT_SETTINGS, type AppSettings } from "./types";

const KEY = "settings";

export async function getSettings(): Promise<AppSettings> {
  const stored = await getValue<AppSettings>(KEY);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await setValue(KEY, next);
  return next;
}
