import "server-only";
import { getValue, setValue } from "./storage";
import type { SubjectChannelMapping } from "./types";

const KEY = "subjectMappings";

export async function listSubjectMappings(): Promise<SubjectChannelMapping[]> {
  return (await getValue<SubjectChannelMapping[]>(KEY)) ?? [];
}

export async function getSubjectMapping(
  subject: string,
): Promise<SubjectChannelMapping | null> {
  const all = await listSubjectMappings();
  return all.find((m) => m.subject.toLowerCase() === subject.toLowerCase()) ?? null;
}

export async function setSubjectMapping(
  mapping: SubjectChannelMapping,
): Promise<void> {
  const all = await listSubjectMappings();
  const filtered = all.filter(
    (m) => m.subject.toLowerCase() !== mapping.subject.toLowerCase(),
  );
  filtered.push(mapping);
  await setValue(KEY, filtered);
}

export async function removeSubjectMapping(subject: string): Promise<void> {
  const all = await listSubjectMappings();
  await setValue(
    KEY,
    all.filter((m) => m.subject.toLowerCase() !== subject.toLowerCase()),
  );
}
