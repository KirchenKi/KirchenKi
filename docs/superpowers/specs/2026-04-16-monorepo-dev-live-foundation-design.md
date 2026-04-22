# Design: Monorepo + Dev/Live-Foundation

**Datum:** 2026-04-16
**Autor:** Jann + Claude (Pairing)
**Status:** Draft — wartet auf User-Review
**Nächster Spec:** n8n → Render Migration (separates Design)

---

## Context

### Ist-Zustand

- **Lokales Monorepo** unter `C:\Users\Jann Brunken\KirchenKi` mit 2 Commits auf `main`, kein GitHub-Remote
- Struktur: `apps/web/` (React aus KirchenKI-main ZIP), `services/social-media/` (Python-Prototyp), `supabase/migrations/`, `n8n/`, `docs/`, `CLAUDE.md`
- **Uncommitted V2-Sprint-Arbeit** (5 neue Files + 4 modifizierte) in `apps/web/`: LandingPageV2, LandingNavV2, SocialMediaSection, FooterMinimal, aurora-background
- **Live (kirchenki.com)** läuft via Netlify-Auto-Deploy aus einem bestehenden GitHub-Repo, 2 Pilot-Kirchen aktiv nutzen die Plattform
- **Supabase** als produktive Instanz (Prod), enthält User-Daten von Piloten
- **n8n** auf `kirchenki.app.n8n.cloud` als produktiver Workflow für Materialien-Pipeline
- **Render-Account** ist aufgesetzt, noch kein Service deployed
- **GitHub-Account**: neuer Shared-Account (Gmail-basiert), beide Co-Founder kennen das Passwort

### Ziel

Eine Foundation, die:
1. Zwei sauber getrennte Environments (Dev + Live) bereitstellt
2. Parallele Arbeit an Features via Branching erlaubt
3. Merge-Flow von Dev → Live etabliert
4. Für zukünftige Features (Feature-Entitlements, weitere Tools pro User freischaltbar) erweiterbar ist
5. Den ersten Schritt weg von n8n ermöglicht (Render-Integration kommt im Folge-Spec)

### Out of Scope (bewusst)

- n8n → Render Migration (folgt als separater Spec, baut auf dieser Foundation)
- Feature-Entitlements-Schema (Product-Level, wird aufgesetzt wenn konkrete Zahl-Tools definiert sind)
- Turborepo / pnpm-workspaces / shared `packages/` (YAGNI bei aktuellem Scope)
- Multi-App-Architektur (`apps/admin`, `apps/academy` etc.) — bleibt Option 1: ein Frontend, mehrere Features
- White-Label / Zweitprodukt (`apps/schulki-web`) — nicht absehbar
- Zentraler Secrets-Store (Doppler, Vault) — Overkill für 2-Personen-Team
- Staging-Umgebung zwischen Dev und Prod — YAGNI
- Feature-Flag-System (Unleash, LaunchDarkly)
- Umfassende Test-Suite (nichts zu testen aktuell außer Build + Lint)

---

## Entscheidungen

### 1. Environment-Architektur

Zwei langlebige Environments, komplett isoliert:

```
┌─────────────────────────────────┬─────────────────────────────────┐
│ DEVELOPMENT                     │ PRODUCTION                      │
├─────────────────────────────────┼─────────────────────────────────┤
│ Branch:    develop              │ Branch:    main                 │
│ Domain:    dev.kirchenki.com    │ Domain:    kirchenki.com        │
│ Frontend:  Netlify Site DEV     │ Frontend:  Netlify Site PROD    │
│ Backend:   Render Service DEV   │ Backend:   Render Service PROD  │
│ Database:  Supabase kirchenki-  │ Database:  Supabase (bestehend) │
│            dev (neu)            │                                 │
│ n8n:       Workflow-Duplikat    │ n8n:       bestehender Workflow │
│            "DEV"                │                                 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**Merge-Flow:**
```
feature/xyz ──PR──▶ develop ──PR──▶ main
                     ▲ auf dev.kirchenki.com testen
                     │ bevor Merge nach main erfolgt
```

Zusätzlich liefert Netlify automatisch Deploy-Previews für jeden Feature-Branch (`deploy-preview-N--<site>.netlify.app`).

**Begründungen:**

- **Zwei getrennte Supabase-Projekte** statt Supabase-Branching (Beta-unreliable) oder Schema-Namespacing (macht RLS-Policies schwierig). Volle Isolation, Migrations risikolos testbar.
- **Subdomain `dev.kirchenki.com`** statt `<xyz>.netlify.app`, weil Shared-Cookie-Setups, Embeds und Tester-Einladungen professioneller wirken und CORS sauberer ist.
- **n8n bleibt vorerst als Cloud-Workflow**, dev-Instanz ist ein Duplikat. Wird im Folge-Spec auf Render migriert.

### 2. Repo-Layout

Ziel-Struktur:

```
kirchenki/
├── apps/
│   └── web/                      # React-Frontend (bleibt unverändert)
│       ├── src/
│       ├── package.json
│       └── netlify.toml
│
├── services/
│   ├── social-media/             # Python FastAPI (Prototyp → später Render)
│   │   ├── app/
│   │   ├── requirements.txt
│   │   └── Dockerfile            # NEU: für Render-Deployment
│   │
│   └── materials-pipeline/       # LEER bis n8n-Migration (kommt im Folge-Spec)
│
├── supabase/
│   ├── migrations/               # Schema-Versionierung
│   └── functions/                # Edge Functions (lokal versioniert statt cloud-only)
│
├── n8n/
│   └── KirchenKI_Workflow_NEU.json   # Versionierter Workflow
│
├── docs/
│   ├── SETUP_GUIDE.md
│   ├── superpowers/specs/        # Design-Docs (dieser Spec liegt hier)
│   └── decisions/                # ADRs für größere Architektur-Entscheidungen
│
├── .github/
│   └── workflows/
│       └── ci.yml                # Lint + Build + Typecheck auf jedem PR
│
├── .claude/                      # Claude Code Config
├── CLAUDE.md                     # Projekt-Kontext
├── README.md                     # NEU: Setup-Anleitung für neue Entwickler
├── .env.example                  # NEU: Template für alle Env-Vars
└── .gitignore
```

**Begründungen:**

- **Kein `packages/`, kein Turborepo**: Jede App / jeder Service hat eigene Dependencies und wird unabhängig gebaut. Einfach, keine Tool-Magie.
- **Ein Service pro Ordner unter `services/`**: macht "mehr Features als Services" später sauber.
- **Supabase Edge Functions lokal versioniert**: verhindert Cloud-Only-Lock-in, deployed via `supabase functions deploy`.
- **`.github/workflows/` nur für Tests/Lint**, nicht für Deploy: Netlify und Render haben eigenes Auto-Deploy, Duplikation wäre Wartungslast.
- **`.env.example` am Root** als Template: neuer Dev macht `cp .env.example .env` und füllt eigene Keys ein.

### 3. Workflow, Zugriffe & Secrets

**GitHub-Repo:**
- Name: `kirchenki` unter dem neuen Shared-Account
- Visibility: **private**
- Beide Co-Founder haben vollen Zugriff (gleicher Account)

**Branch-Protection:**

| Branch | Regeln |
|---|---|
| `main` | PR erforderlich, CI muss grün sein, kein Force-Push. **Keine** Approval-Pflicht (bei Shared-Account sinnlos). |
| `develop` | Direkte Pushes erlaubt, CI muss grün sein, kein Force-Push. |
| `feature/*` | Keine Protection, totale Freiheit. |

**Daily Workflow:**

```
1. git checkout develop && git pull
2. git checkout -b feature/xyz
3. ... arbeiten, committen ...
4. git push origin feature/xyz
5. PR gegen develop auf GitHub
   → Netlify baut Preview-URL
   → CI läuft (build + lint + typecheck)
6. Self-Merge nach CI grün (PR-Workflow ist Disziplin, nicht Zwang)
7. develop pushed auto zu dev.kirchenki.com
8. Wenn develop stabil → PR develop → main → Release
```

**Secrets-Management (drei Ebenen, streng getrennt):**

| Typ | Wo | Wer pflegt |
|---|---|---|
| **Lokale Dev-Secrets** | `.env` Files lokal (gitignored) | Jeder Dev selbst, kopiert aus `.env.example` |
| **Dev-Environment Secrets** | Netlify Env Vars (Dev Site), Render Env Vars (Dev Service), Supabase Project Settings (Dev) | Manuell in Web-UIs |
| **Prod-Environment Secrets** | Netlify Env Vars (Prod Site), Render Env Vars (Prod Service), Supabase Project Settings (Prod) | Manuell in Web-UIs, nur Shared-Account hat Zugriff |

**Nicht in Secrets-Strategie:**
- Kein zentraler Secrets-Store (Doppler/Vault) — Overengineering für 2-Personen-Team
- Keine Secrets in GitHub Actions Secrets (außer CI bräuchte konkret welche — aktuell nicht der Fall)
- Keine verschlüsselten `.env`-Files in Git

**Rotation:** Manuell in Netlify + Render + Supabase updaten, neuen Wert über sicheren Kanal (1Password/Signal) zwischen Co-Foundern teilen.

### 4. Migrationspfad (Ist → Soll)

**Leitprinzip: Alter Live-Stack läuft ununterbrochen weiter**

Das zentrale Versprechen dieser Migration: Während der gesamten Umstellung bleibt kirchenki.com für die Pilot-Kirchen ohne Unterbrechung erreichbar, mit exakt demselben Code wie bisher. Parallel baut sich dev.kirchenki.com auf, wo die V2-Arbeit läuft. Erst wenn V2 stabil ist, wird via `develop → main` PR die neue Version auf kirchenki.com ausgerollt.

**Ablauf der User-Sicht:**
```
Tag 0:    kirchenki.com = alte Version (aus altem Repo)
Tag 1:    kirchenki.com = alte Version (aus NEUEM Repo, Netlify-Switch, identischer Code)
          dev.kirchenki.com = V2-Version (aus develop)
Tag 1-N:  Arbeit auf develop, kirchenki.com bleibt unverändert
Tag N+1:  PR develop → main → kirchenki.com = V2-Version
```

Die Kritische Invariante: **`main` im neuen Repo enthält bei Phase-2-Switch exakt den Code, der aktuell auf kirchenki.com läuft.** Keine V2-Arbeit, keine Experimente. V2 liegt ausschließlich auf `develop`, bis es explizit gemerged wird.

**Reihenfolge-Flexibilität:**
Phase 1 muss zuerst. Danach sind Phase 2, 3, 4 unabhängig voneinander und können in beliebiger Reihenfolge oder parallel laufen. Empfohlen: Phase 1 → Phase 3 (Dev-Env + V2-Arbeit kann schon losgehen) → Phase 4 → Phase 2 zuletzt (erst wenn alles andere stabil ist). Phase 5 ist ganz deferred.



**Phase 1 — GitHub-Repo & Branches** *(niedriges Risiko)*

1. Neues privates Repo `kirchenki` unter dem Shared-Account erstellen
2. Uncommitted V2-Arbeit lokal stashen: `git stash -u`
3. Aktuelles lokales `main` (2 Commits) zum neuen Remote pushen: `git remote add origin <url> && git push -u origin main`
4. `develop` von `main` abzweigen, pushen
5. V2-Arbeit aus Stash holen, auf `develop` committen + pushen
6. Branch-Protection-Rules in GitHub-UI setzen gemäß Tabelle oben

**Phase 2 — Live-Netlify auf neues Repo umstecken** *(Risiko: Prod, aber durch Verifikation minimiert)*

**Vorab-Verifikation (bevor der Switch passiert):**
- Sicherstellen, dass `main` im neuen Repo byte-identisch den aktuellen Live-Stand abbildet. Diff ziehen: `git diff <alter-repo-main> <neuer-repo-main>` muss leer sein (bis auf evtl. neu hinzugefügte Monorepo-Meta-Files wie `.claude/`, `docs/`, `CLAUDE.md`, `n8n/`, `services/`, die nicht in `apps/web/` liegen)
- Falls Diff nicht leer: Zuerst den echten Live-Stand in `apps/web/` auf `main` nachziehen, bevor der Switch passiert

**Switch-Schritte:**
1. In Netlify-Dashboard (Prod-Site `kirchenki.com`): Site Settings → Build & Deploy → "Link to a different repository"
2. Neues Repo `kirchenki` auswählen, Branch `main`
3. Build-Settings:
   - Base directory: `apps/web`
   - Build command: `npm run build`
   - Publish directory: `dist` (relativ zur Base)
4. Trigger rebuild, Ergebnis visuell prüfen gegen aktuelle kirchenki.com (sollte identisch aussehen)
5. Bei Build-Fehler: Netlify hält den letzten grünen Deploy live — kein Downtime
6. Rollback-Option bei nicht-reparierbarem Fehler: In Netlify Site Settings auf altes Repo zurück-linken, altes Setup funktioniert weiter
7. Nach erfolgreichem Switch: altes GitHub-Repo als "Archived" markieren (nicht löschen, als Backup lesbar)

**Phase 3 — Dev-Environment aufbauen** *(kein Risiko, läuft parallel)*

1. Supabase-Dashboard: neues Projekt `kirchenki-dev` anlegen
2. **Schema-Sync-Check**: Prüfen, ob `supabase/migrations/` den aktuellen Prod-Stand abbildet. Falls historisch Änderungen direkt im Supabase-UI gemacht wurden: aktuellen Prod-Schema-Dump ziehen (`supabase db dump --schema public > supabase/migrations/YYYYMMDD_schema_baseline.sql` oder via Supabase Dashboard SQL Editor), als neue Baseline-Migration committen. Erst danach auf Dev anwenden.
3. Schema auf Dev-Instanz anwenden: `supabase db push` mit Dev-Credentials
4. Optional: `supabase/seed.sql` mit minimalen Test-Daten (1-2 Test-User, 1 Fake-Predigt) anlegen. **Keine** Prod-Daten klonen (DSGVO).
5. Netlify: neue Site aus Repo `kirchenki`, Branch `develop`, Base `apps/web`
6. Custom Domain `dev.kirchenki.com` via DNS CNAME beim Domain-Provider aufsetzen
7. Dev-Site Env-Vars mit Dev-Supabase-Keys und Dev-API-Keys befüllen
8. n8n: bestehenden Workflow in n8n-Cloud duplizieren, benennen als "KirchenKI DEV", Webhook-URLs und Credentials auf Dev-Supabase umstellen

**Phase 4 — CI & Docs** *(niedriges Risiko)*

1. `.github/workflows/ci.yml` erstellen mit Jobs: `lint` (eslint), `build` (vite build), `typecheck` (tsc --noEmit). Läuft auf jeden PR gegen `develop` oder `main`.
2. `README.md` am Repo-Root schreiben: Was ist KirchenKI, wie setze ich das lokal auf (clone → cp .env.example .env → cd apps/web && npm install && npm run dev)
3. `.env.example` am Repo-Root mit allen Env-Var-Namen (Dummy-Werte): Supabase URL/Keys, OpenAI, Replicate, n8n-Webhook-URLs etc.
4. `CLAUDE.md` updaten: Branch-Realität dokumentieren (statt nur Ziel), Env-Struktur erklären
5. `docs/decisions/ADR-001-monorepo-dev-live.md` committen mit Zusammenfassung dieses Specs

**Phase 5 — Render vorbereiten (minimal)** *(kein Risiko, deferred)*

1. Beide Co-Founder haben Team-Zugriff auf den Render-Account
2. Noch **kein** Service anlegen — erfolgt im n8n-Migrations-Spec, wenn ersten Python-Service deployed wird

**Phase 6 — Alter Stack Retirement** *(nicht Teil dieses Specs)*

Wenn V2-Arbeit via develop → main live ist und stabil läuft, wird der alte Netlify-Build-Pfad endgültig bereinigt. Passiert als Nebenprodukt des normalen Dev-Live-Flows, kein expliziter Migrations-Schritt.

### Rollback-Strategie

| Phase | Rollback |
|---|---|
| 1 | Trivial — lokales Repo ist Source of Truth, GitHub nur Mirror. Einfach remote löschen, neu anfangen. |
| 2 | Netlify Deploy History → alten grünen Deploy als "Published" markieren. DNS bleibt gleich, keine User merken was. |
| 3 | Dev komplett separat, kaputt machen stört Prod nicht. |
| 4 | Nur Dateien/Config, reversibel via Git. |
| 5 | Keine Änderung, nur Account-Access. |

---

## Zusammenfassung der abgestimmten Entscheidungen

| Thema | Entscheidung |
|---|---|
| Branching | Dev/Live-Pattern (`main` + `develop` + `feature/*`) |
| Multi-Produkt-Strategie | Option 1 — mehrere Features in einer App |
| Startzustand | Aktueller Live-Stack wird `main`, V2-Arbeit wird `develop` |
| Repo-Migration | Variante B — neues Repo, Netlify umstecken |
| GitHub-Account | Shared-Account (beide kennen Passwort) |
| Monorepo-Tool | Keines (keine Turborepo, keine pnpm-workspaces) |
| Supabase-Strategie | Zwei separate Projekte (dev + prod) |
| Secrets-Management | Manuell in Netlify/Render/Supabase-UIs, kein zentraler Store |
| CI/CD | GitHub Actions nur für Lint/Build/Typecheck, Deploys via Netlify/Render auto |
| Branch-Protection | `main`: PR + CI required; `develop`: CI required; `feature/*`: frei |

---

## Offene Fragen (zur Klärung beim Umsetzen, nicht blockierend fürs Design)

1. **Welche Env-Vars gibt es aktuell?** Bei Phase 4 müssen wir die konkrete Liste der Env-Vars aus dem aktuellen Netlify auslesen, um `.env.example` zu füllen.
2. **Wer macht Phase 2 (Netlify-Umswitch)?** Du oder Co-Founder? Zeitslot wählen mit niedriger User-Aktivität (z.B. Abend/Wochenende).
3. **Bildet `supabase/migrations/` den echten Prod-Schema-Stand ab?** Falls nein: Baseline-Migration aus Prod-Dump erzeugen (siehe Phase 3 Schritt 2).
4. **Wie füllen wir Dev-Supabase mit Testdaten?** Manuell ein paar Fake-Einträge oder Seed-Script? Empfehlung: minimales Seed-Script damit UI nicht leer ist, aber keine Prod-Daten klonen (DSGVO).
5. **n8n Dev-Workflow-Credentials**: Bekommt ein neues OpenAI-API-Sub-Projekt für Dev-Usage-Tracking? Oder nutzen wir denselben Key mit Rate-Limit? Empfehlung: eigener Key fürs Tracking, aber nicht blockierend.

---

## Nächste Schritte (nach Spec-Approval)

1. Implementation-Plan schreiben via `writing-plans` Skill (detaillierte Task-Breakdown pro Phase)
2. Plan durchgehen, pro Task:
   - Phase 1 zuerst (GitHub-Setup, niedriges Risiko)
   - Phase 3 parallel (Dev-Env, kein Risiko)
   - Phase 4 parallel (CI, Docs)
   - Phase 2 letzter großer Schritt (Netlify-Umswitch, mit Co-Founder abgestimmt)
   - Phase 5 minimal (nur Account-Access)
3. Nach Foundation-Abschluss: Folge-Spec für n8n → Render Migration
