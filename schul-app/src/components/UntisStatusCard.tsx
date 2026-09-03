import { Tag } from "@/components/Tag";

export function UntisStatusCard({ configured }: { configured: boolean }) {
  return (
    <section className="border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">WebUntis</h2>
        <Tag tone={configured ? "accent" : "neutral"}>
          {configured ? "Eingerichtet" : "Nicht eingerichtet"}
        </Tag>
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
