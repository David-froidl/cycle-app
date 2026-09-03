"use client";

import { useTransition } from "react";
import { setEveningRoutineEnabledAction } from "@/app/actions/settings";

export function EveningRoutineToggle({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-text">Abendroutine</h2>
          <p className="mt-0.5 text-xs text-text-dim">
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
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-accent" : "bg-surface-2"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
