import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { hasActiveLearningPlan } from "@/lib/learningPlan";
import { listEveningEntries } from "@/lib/evening";
import { EveningForm } from "@/components/EveningForm";
import { EveningHistory } from "@/components/EveningHistory";

export const dynamic = "force-dynamic";

export default async function AbendPage() {
  const [settings, activePlan, entries] = await Promise.all([
    getSettings(),
    hasActiveLearningPlan(),
    listEveningEntries(),
  ]);

  if (!settings.eveningRoutineEnabled) {
    return (
      <div className="space-y-10">
        <h1 className="text-lg font-medium text-text">Abendroutine</h1>
        <p className="border border-line bg-surface p-5 text-sm text-text-dim">
          Die Abendroutine ist ausgeschaltet.{" "}
          <Link href="/einstellungen" className="text-accent underline underline-offset-4">
            In den Einstellungen aktivieren
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="text-lg font-medium text-text">Abendroutine</h1>
      <EveningForm askTomorrowLearning={!activePlan} />
      <EveningHistory entries={entries} />
    </div>
  );
}
