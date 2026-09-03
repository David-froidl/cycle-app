import { createAssignmentAction } from "@/app/actions/assignments";
import { todayISO } from "@/lib/date";

const FIELD =
  "w-full border-b border-line bg-transparent px-0 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none";

export function AssignmentForm() {
  return (
    <form action={createAssignmentAction} className="space-y-5">
      <div className="flex gap-5 text-sm">
        <label className="flex items-center gap-1.5 text-text-dim">
          <input type="radio" name="type" value="abgabe" defaultChecked className="accent-accent" />
          Abgabe
        </label>
        <label className="flex items-center gap-1.5 text-text-dim">
          <input type="radio" name="type" value="pruefung" className="accent-accent" />
          Prüfung
        </label>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <input name="subject" placeholder="Fach" required className={FIELD} />
        <input
          name="dueDate"
          type="date"
          required
          defaultValue={todayISO()}
          className={FIELD}
        />
      </div>

      <input name="title" placeholder="Titel" required className={FIELD} />

      <textarea
        name="note"
        placeholder="Notiz (optional)"
        rows={2}
        className={`${FIELD} resize-none`}
      />

      <button
        type="submit"
        className="bg-accent px-4 py-2 text-sm text-bg transition-opacity hover:opacity-90"
      >
        Eintragen
      </button>
    </form>
  );
}
