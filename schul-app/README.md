# Schule

Persönliche Morgenansicht für einen HTL-Schüler: heutiger Stundenplan (WebUntis),
offene Abgaben/Prüfungen und ein KI-generierter Lernplan aus den Teams-Unterrichtsinhalten.
Single-User, kein Login, kein Gamification.

## Setup

```bash
npm install
cp .env.example .env.local   # dann Werte eintragen, siehe unten
npm run dev
```

### 1. WebUntis

Setze `WEBUNTIS_USERNAME` / `WEBUNTIS_PASSWORD` (dein normaler WebUntis-Login).
Server und Schule sind bereits auf `htl-saalfelden.webuntis.com` / `htl-saalfelden`
vorkonfiguriert. Ohne diese Variablen zeigt die App einen Hinweis statt eines
Stundenplans, alles andere funktioniert weiter.

### 2. Microsoft Teams (optional, für den Lernplan)

1. [portal.azure.com](https://portal.azure.com) → Azure Active Directory → App
   registrations → New registration.
   - Redirect URI (Web): `https://<deine-domain>/api/graph/callback`
     (lokal: `http://localhost:3000/api/graph/callback`)
2. API permissions → Microsoft Graph → **Delegated**: `ChannelMessage.Read.All`,
   `Files.Read.All`, `Team.ReadBasic.All`, `Channel.ReadBasic.All`,
   `offline_access`. Falls dein Tenant es verlangt: Admin-Consent einholen.
3. Certificates & secrets → New client secret.
4. `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_REDIRECT_URI`, `MS_TENANT_ID` setzen.
5. In der App unter **Einstellungen** → "Mit Microsoft verbinden", danach pro
   Fach den passenden Team-Kanal zuordnen.

Falls die Schule OAuth für Schüler-Accounts sperrt: Lernpläne werden dann ohne
Teams-Inhalte erstellt (Hinweis erscheint im Plan). Ein Foto-Upload als Ersatz
für den Stoff-Import ist als Notlösung vorgesehen, aber noch nicht gebaut.

### 3. Anthropic API (Lernplan-Generierung)

`ANTHROPIC_API_KEY` setzen. Ein Prüfungs-Eintrag unter „Abgaben“ löst die
Lernplan-Generierung automatisch aus.

### 4. Speicherung

Vercel Marketplace → Redis (Upstash)-Integration hinzufügen — setzt
`KV_REST_API_URL`/`KV_REST_API_TOKEN` automatisch. Lokal bzw. ohne Redis
schreibt die App stattdessen in `.data/store.local.json` (nicht persistent auf
Vercels Serverless-Dateisystem, nur für lokale Entwicklung geeignet).

## Deployment

Separates Vercel-Projekt mit Root Directory `schul-app` (dieses Repo enthält
noch eine unabhängige App im Repo-Root). Environment Variables wie oben in den
Vercel-Projekteinstellungen setzen.

## Struktur

- `src/lib/` – Kernlogik (WebUntis-Client, MS-Graph-Client, Text-Extraktion,
  LLM-Aufruf, Storage-Abstraktion), serverseitig.
- `src/app/actions/` – Server Actions für Formulare (Abgaben, Abendroutine,
  Einstellungen).
- `src/app/api/` – Route Handler für OAuth-Redirects und externe Proxys.
- `src/app/*/page.tsx` – Morgenansicht, Abgaben, Lernplan-Timeline,
  Abendroutine, Einstellungen.
