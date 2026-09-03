export function UntisStatusCard({ configured }: { configured: boolean }) {
  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">WebUntis</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[0.7rem] ${
            configured ? "bg-ok-soft text-ok" : "bg-surface-2 text-text-dim"
          }`}
        >
          {configured ? "Eingerichtet" : "Nicht eingerichtet"}
        </span>
      </div>
      <p className="mt-2 text-xs text-text-dim">
        Server: htl-saalfelden.webuntis.com · Schule: htl-saalfelden
      </p>
      {!configured && (
        <p className="mt-2 text-xs text-text-dim">
          WEBUNTIS_USERNAME und WEBUNTIS_PASSWORD als Environment Variables setzen
          (nie im Frontend), siehe README.
        </p>
      )}
    </section>
  );
}
