import "server-only";
import { fetchChannelMessagesSince, downloadSharedFile, isGraphConnected } from "./graph";
import { extractTextFromFile, stripHtml } from "./extract";
import { getSubjectMapping } from "./subjectMapping";

export interface SubjectContentResult {
  text: string;
  sourceNote: string;
}

/**
 * Pulls the last `weeks` of Teams channel activity mapped to a subject:
 * message text plus extracted text from any linked PDF/Word/PowerPoint
 * attachments. Returns an empty result (with an explanatory note) whenever
 * Graph isn't connected or the subject has no channel mapped yet — the
 * caller (learning plan generation) is expected to degrade gracefully.
 */
export async function getSubjectContent(
  subject: string,
  weeks = 4,
): Promise<SubjectContentResult> {
  if (!(await isGraphConnected())) {
    return {
      text: "",
      sourceNote:
        "Microsoft Teams ist nicht verbunden — der Lernplan basiert nur auf Stundenplan und offenen Terminen.",
    };
  }

  const mapping = await getSubjectMapping(subject);
  if (!mapping) {
    return {
      text: "",
      sourceNote: `Für "${subject}" ist noch kein Teams-Kanal hinterlegt (siehe Einstellungen) — der Lernplan basiert nur auf Stundenplan und offenen Terminen.`,
    };
  }

  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const messages = await fetchChannelMessagesSince(
    mapping.teamId,
    mapping.channelId,
    since,
  );

  const parts: string[] = [];
  for (const message of messages) {
    const text = stripHtml(message.body?.content ?? "");
    if (text) parts.push(text);

    for (const attachment of message.attachments ?? []) {
      if (!attachment.contentUrl || !attachment.name) continue;
      const buffer = await downloadSharedFile(attachment.contentUrl);
      if (!buffer) continue;
      const extracted = await extractTextFromFile(attachment.name, buffer);
      if (extracted.trim()) {
        parts.push(`[Datei: ${attachment.name}]\n${extracted.trim()}`);
      }
    }
  }

  return {
    text: parts.join("\n\n---\n\n"),
    sourceNote: `Stoff aus dem Teams-Kanal "${mapping.channelName ?? mapping.channelId}" der letzten ${weeks} Wochen (${messages.length} Nachrichten).`,
  };
}
