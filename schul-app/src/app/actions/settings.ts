"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "@/lib/settings";

export async function setEveningRoutineEnabledAction(
  enabled: boolean,
): Promise<void> {
  await updateSettings({ eveningRoutineEnabled: enabled });
  revalidatePath("/");
  revalidatePath("/abend");
  revalidatePath("/einstellungen");
}
