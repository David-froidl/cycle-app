"use server";

import { revalidatePath } from "next/cache";
import { createEveningEntry } from "@/lib/evening";
import { todayISO } from "@/lib/date";

export async function createEveningEntryAction(formData: FormData): Promise<void> {
  const dayDone = String(formData.get("dayDone") ?? "").trim();
  const openItems = String(formData.get("openItems") ?? "").trim();
  const tomorrowLearning = String(formData.get("tomorrowLearning") ?? "").trim();

  await createEveningEntry({
    date: todayISO(),
    dayDone,
    openItems,
    tomorrowLearning: tomorrowLearning || undefined,
  });

  revalidatePath("/");
  revalidatePath("/abend");
}
