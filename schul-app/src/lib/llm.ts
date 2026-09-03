import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AssignmentEntry, DayTimetable, LearningBlock } from "./types";
import { daysBetween, todayISO } from "./date";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
const MAX_CONTENT_CHARS = 14_000;

function client(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY ist nicht gesetzt");
  }
  return new Anthropic({ apiKey });
}

interface GeneratePlanInput {
  subject: string;
  examDate: string;
  contentText: string;
  contentSourceNote: string;
  days: DayTimetable[];
  otherAssignments: AssignmentEntry[];
}

function buildPrompt(input: GeneratePlanInput): string {
  const today = todayISO();
  const daysUntilExam = daysBetween(today, input.examDate);

  const scheduleSummary = input.days
    .filter((d) => d.date >= today && d.date <= input.examDate)
    .map((d) => {
      const tag = d.isLongDay ? " [LANGER SCHULTAG]" : "";
      const freeCount = d.freePeriods.length;
      return `${d.date}: ${d.lessonCount} Stunden${tag}${freeCount ? `, ${freeCount} Freistunde(n)` : ""}`;
    })
    .join("\n");

  const deadlineSummary = input.otherAssignments
    .filter((a) => a.dueDate >= today && a.dueDate <= input.examDate)
    .map((a) => `${a.dueDate}: ${a.subject} – ${a.title} (${a.type})`)
    .join("\n") || "keine";

  const content = input.contentText.trim()
    ? input.contentText.slice(0, MAX_CONTENT_CHARS)
    : "(kein Unterrichtsmaterial verfügbar — plane anhand des Fachs allgemein, weise im Titel/Beschreibung transparent darauf hin, dass der Schüler seine eigenen Unterlagen konsultieren muss.)";

  return `Du erstellst einen Tag-für-Tag-Lernplan für einen HTL-Schüler (Elektrotechnik).

Fach: ${input.subject}
Prüfungstermin: ${input.examDate} (in ${daysUntilExam} Tagen, heute ist ${today})

Stundenplan bis zur Prüfung (Stundenanzahl pro Tag, lange Schultage markiert):
${scheduleSummary || "keine Daten"}

Bereits bestehende Abgaben/Prüfungen in diesem Zeitraum (NICHT verschieben, das sind fixe Termine):
${deadlineSummary}

Unterrichtsinhalt der letzten Wochen (${input.contentSourceNote}):
"""
${content}
"""

Erstelle einen Lernplan als JSON-Array. Regeln:
- Zerlege den Stoff in sinnvolle inhaltliche Blöcke (konkrete Themen, nicht "Kapitel 1, 2, 3").
- Verteile die Blöcke auf die verfügbaren Tage bis zur Prüfung (inklusive Prüfungstag als Wiederholungstag, falls sinnvoll).
- An Tagen, die als "LANGER SCHULTAG" markiert sind, plane kein oder nur ein sehr kurzes Lernblock ein.
- Füge gelegentlich kurze "Stundenwiederholung"-Blöcke ein (kind: "wiederholung") als lockeren Dauerbegleiter, nicht nur Prüfungsvorbereitung.
- Jeder Block hat: date (YYYY-MM-DD), title (kurz, konkret), description (1-2 Sätze, was genau zu tun ist), kind ("vorbereitung" oder "wiederholung").
- Antworte NUR mit dem JSON-Array, ohne Fließtext davor oder danach, ohne Markdown-Codeblock.`;
}

function extractJsonArray(text: string): unknown[] {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to bracket extraction below
  }
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("LLM-Antwort enthielt kein gültiges JSON-Array");
  }
  const parsed = JSON.parse(trimmed.slice(start, end + 1));
  if (!Array.isArray(parsed)) {
    throw new Error("LLM-Antwort war kein Array");
  }
  return parsed;
}

function normalizeBlock(raw: unknown): LearningBlock | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.date !== "string" || typeof r.title !== "string") return null;
  const kind = r.kind === "wiederholung" ? "wiederholung" : "vorbereitung";
  return {
    date: r.date,
    title: r.title,
    description: typeof r.description === "string" ? r.description : "",
    kind,
  };
}

export async function generateLearningPlan(
  input: GeneratePlanInput,
): Promise<LearningBlock[]> {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const rawBlocks = extractJsonArray(text);
  const blocks = rawBlocks
    .map(normalizeBlock)
    .filter((b): b is LearningBlock => b !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (blocks.length === 0) {
    throw new Error("LLM hat keinen verwertbaren Lernplan geliefert");
  }
  return blocks;
}
