import { createEveningEntryAction } from "@/app/actions/evening";

export function EveningForm({ askTomorrowLearning }: { askTomorrowLearning: boolean }) {
  return (
    <form
      action={createEveningEntryAction}
      className="space-y-4 rounded-md border border-line bg-surface p-4"
    >
      <div>
        <label className="text-sm text-text">Tag geschafft?</label>
        <textarea
          name="dayDone"
          rows={2}
          className="mt-1 w-full resize-none rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          placeholder="Kurz, wie der Tag war…"
        />
      </div>
      <div>
        <label className="text-sm text-text">Was ist noch offen?</label>
        <textarea
          name="openItems"
          rows={2}
          className="mt-1 w-full resize-none rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          placeholder="Was liegen bleibt…"
        />
      </div>
      {askTomorrowLearning && (
        <div>
          <label className="text-sm text-text">Was morgen lernen?</label>
          <textarea
            name="tomorrowLearning"
            rows={2}
            className="mt-1 w-full resize-none rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            placeholder="Erscheint morgen früh im Feld 'Heute lernen'…"
          />
        </div>
      )}
      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
      >
        Speichern
      </button>
    </form>
  );
}
