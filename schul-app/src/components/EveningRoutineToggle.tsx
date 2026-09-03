"use client";

import { useTransition } from "react";
import { setEveningRoutineEnabledAction } from "@/app/actions/settings";

export function EveningRoutineToggle({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <section className="border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-text">Abendroutine</h2>
          <p className="mt-1 text-xs text-text-dim">
            Drei kurze Fragen am Abend, reine Notiz-Historie.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          disabled={isPending}
          onClick={() =>
            startTransition(() => setEveningRoutineEnabledAction(!enabled))
          }
          className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
            enabled ? "border-accent bg-accent" : "border-line bg-transparent"
          }`}
        >
          <span
            className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-transform ${
              enabled ? "translate-x-4 bg-bg" : "translate-x-0.5 bg-text-dim"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
