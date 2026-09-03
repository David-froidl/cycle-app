import { Tag } from "@/components/Tag";

export function GraphConnectionCard({
  connected,
  configured,
  error,
  justConnected,
}: {
  connected: boolean;
  configured: boolean;
  error?: string;
  justConnected?: boolean;
}) {
  if (!configured) {
    return (
      <section className="border border-line bg-surface p-5">
        <h2 className="text-sm font-medium text-text">Microsoft Teams</h2>
        <p className="mt-2 text-sm text-text-dim">
          Nicht konfiguriert. MS_CLIENT_ID, MS_CLIENT_SECRET und MS_REDIRECT_URI als
          Environment Variables setzen (Azure AD App-Registrierung), siehe README.
        </p>
        <p className="mt-2 text-xs text-text-dim">
          Falls die Schule OAuth für Schüler-Accounts sperrt: Foto-Upload der
          Unterlagen ist die Notlösung, kein manuelles Abtippen nötig.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">Microsoft Teams</h2>
        <Tag tone={connected ? "accent" : "neutral"}>
          {connected ? "Verbunden" : "Nicht verbunden"}
        </Tag>
      </div>
      {justConnected && (
        <p className="mt-2 text-xs text-accent">Verbindung erfolgreich hergestellt.</p>
      )}
      {error && <p className="mt-2 text-xs text-danger">Fehler: {error}</p>}
      {!connected && (
        <a
          href="/api/graph/login"
          className="mt-4 inline-block bg-accent px-3 py-1.5 text-xs text-bg hover:opacity-90"
        >
          Mit Microsoft verbinden
        </a>
      )}
      {connected && (
        <p className="mt-2 text-xs text-text-dim">
          Kanal-Zuordnungen pro Fach unten festlegen, damit der Lernplan die
          richtigen Teams-Inhalte findet.
        </p>
      )}
    </section>
  );
}
