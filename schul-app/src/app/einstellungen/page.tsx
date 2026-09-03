import { isUntisConfigured } from "@/lib/untis";
import { isGraphConfigured, isGraphConnected } from "@/lib/graph";
import { listSubjectMappings } from "@/lib/subjectMapping";
import { getSettings } from "@/lib/settings";
import { UntisStatusCard } from "@/components/UntisStatusCard";
import { GraphConnectionCard } from "@/components/GraphConnectionCard";
import { SubjectMappingManager } from "@/components/SubjectMappingManager";
import { EveningRoutineToggle } from "@/components/EveningRoutineToggle";

export const dynamic = "force-dynamic";

export default async function EinstellungenPage(
  props: PageProps<"/einstellungen">,
) {
  const searchParams = await props.searchParams;
  const graphError = firstParam(searchParams.graph_error);
  const justConnected = firstParam(searchParams.graph_connected) === "1";

  const [untisConfigured, graphConfigured, graphConnected, mappings, settings] =
    await Promise.all([
      Promise.resolve(isUntisConfigured()),
      Promise.resolve(isGraphConfigured()),
      isGraphConnected(),
      listSubjectMappings(),
      getSettings(),
    ]);

  return (
    <div className="space-y-10">
      <h1 className="text-lg font-medium text-text">Einstellungen</h1>
      <UntisStatusCard configured={untisConfigured} />
      <GraphConnectionCard
        configured={graphConfigured}
        connected={graphConnected}
        error={graphError}
        justConnected={justConnected}
      />
      <SubjectMappingManager mappings={mappings} connected={graphConnected} />
      <EveningRoutineToggle enabled={settings.eveningRoutineEnabled} />
    </div>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
