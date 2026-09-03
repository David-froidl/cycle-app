import { createEveningEntryAction } from "@/app/actions/evening";

const FIELD =
  "mt-2 w-full resize-none border-b border-line bg-transparent px-0 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none";

export function EveningForm({ askTomorrowLearning }: { askTomorrowLearning: boolean }) {
  return (
    <form action={createEveningEntryAction} className="space-y-6">
      <div>
        <label className="text-sm text-text">Tag geschafft?</label>
        <textarea
          name="dayDone"
          rows={2}
          className={FIELD}
          placeholder="Kurz, wie der Tag war…"
        />
      </div>
      <div>
        <label className="text-sm text-text">Was ist noch offen?</label>
        <textarea
          name="openItems"
          rows={2}
          className={FIELD}
          placeholder="Was liegen bleibt…"
        />
      </div>
      {askTomorrowLearning && (
        <div>
          <label className="text-sm text-text">Was morgen lernen?</label>
          <textarea
            name="tomorrowLearning"
            rows={2}
            className={FIELD}
            placeholder="Erscheint morgen früh im Feld 'Heute lernen'…"
          />
        </div>
      )}
      <button
        type="submit"
        className="bg-accent px-4 py-2 text-sm text-bg hover:opacity-90"
      >
        Speichern
      </button>
    </form>
  );
}
