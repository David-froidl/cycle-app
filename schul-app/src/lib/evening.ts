import "server-only";
import { randomUUID } from "crypto";
import { getValue, setValue } from "./storage";
import type { EveningEntry } from "./types";

const KEY = "eveningEntries";

export async function listEveningEntries(): Promise<EveningEntry[]> {
  const all = (await getValue<EveningEntry[]>(KEY)) ?? [];
  return [...all].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getLatestEveningEntry(): Promise<EveningEntry | null> {
  const all = await listEveningEntries();
  return all[0] ?? null;
}

export async function createEveningEntry(input: {
  date: string;
  dayDone: string;
  openItems: string;
  tomorrowLearning?: string;
}): Promise<EveningEntry> {
  const all = (await getValue<EveningEntry[]>(KEY)) ?? [];
  const entry: EveningEntry = {
    id: randomUUID(),
    date: input.date,
    dayDone: input.dayDone.trim(),
    openItems: input.openItems.trim(),
    tomorrowLearning: input.tomorrowLearning?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  // Replace an existing entry for the same day rather than duplicating it.
  const filtered = all.filter((e) => e.date !== input.date);
  filtered.push(entry);
  await setValue(KEY, filtered);
  return entry;
}
