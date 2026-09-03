import { createAssignmentAction } from "@/app/actions/assignments";
import { todayISO } from "@/lib/date";

export function AssignmentForm() {
  return (
    <form
      action={createAssignmentAction}
      className="space-y-3 rounded-md border border-line bg-surface p-4"
    >
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1.5 text-text-dim">
          <input type="radio" name="type" value="abgabe" defaultChecked className="accent-accent" />
          Abgabe
        </label>
        <label className="flex items-center gap-1.5 text-text-dim">
          <input type="radio" name="type" value="pruefung" className="accent-accent" />
          Prüfung
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          name="subject"
          placeholder="Fach"
          required
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
        <input
          name="dueDate"
          type="date"
          required
          defaultValue={todayISO()}
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        />
      </div>

      <input
        name="title"
        placeholder="Titel"
        required
        className="w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
      />

      <textarea
        name="note"
        placeholder="Notiz (optional)"
        rows={2}
        className="w-full resize-none rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
      />

      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        Eintragen
      </button>
    </form>
  );
}
