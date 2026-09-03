import "server-only";
import { randomUUID } from "crypto";
import { getValue, setValue } from "./storage";
import type { AssignmentEntry } from "./types";

const KEY = "assignments";

export async function listAssignments(): Promise<AssignmentEntry[]> {
  return (await getValue<AssignmentEntry[]>(KEY)) ?? [];
}

export async function getAssignment(id: string): Promise<AssignmentEntry | null> {
  const all = await listAssignments();
  return all.find((a) => a.id === id) ?? null;
}

export async function createAssignment(input: {
  type: AssignmentEntry["type"];
  subject: string;
  title: string;
  dueDate: string;
  note?: string;
}): Promise<AssignmentEntry> {
  const all = await listAssignments();
  const entry: AssignmentEntry = {
    id: randomUUID(),
    type: input.type,
    subject: input.subject.trim(),
    title: input.title.trim(),
    dueDate: input.dueDate,
    note: input.note?.trim() || undefined,
    done: false,
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  await setValue(KEY, all);
  return entry;
}

export async function updateAssignment(
  id: string,
  patch: Partial<Pick<AssignmentEntry, "done" | "title" | "note" | "dueDate" | "subject">>,
): Promise<AssignmentEntry | null> {
  const all = await listAssignments();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  await setValue(KEY, all);
  return all[idx];
}

export async function deleteAssignment(id: string): Promise<void> {
  const all = await listAssignments();
  await setValue(
    KEY,
    all.filter((a) => a.id !== id),
  );
}

export function sortByUrgency(items: AssignmentEntry[]): AssignmentEntry[] {
  return [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
