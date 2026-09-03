"use server";

import { revalidatePath } from "next/cache";
import { removeSubjectMapping, setSubjectMapping } from "@/lib/subjectMapping";

export async function setSubjectMappingAction(formData: FormData): Promise<void> {
  const subject = String(formData.get("subject") ?? "").trim();
  const teamId = String(formData.get("teamId") ?? "").trim();
  const teamName = String(formData.get("teamName") ?? "").trim();
  const channelId = String(formData.get("channelId") ?? "").trim();
  const channelName = String(formData.get("channelName") ?? "").trim();

  if (!subject || !teamId || !channelId) {
    throw new Error("Fach, Team und Kanal sind erforderlich");
  }

  await setSubjectMapping({
    subject,
    teamId,
    teamName: teamName || undefined,
    channelId,
    channelName: channelName || undefined,
  });

  revalidatePath("/einstellungen");
}

export async function removeSubjectMappingAction(subject: string): Promise<void> {
  await removeSubjectMapping(subject);
  revalidatePath("/einstellungen");
}
