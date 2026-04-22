# Monorepo + Dev/Live-Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aus dem lokalen Monorepo eine production-ready Foundation bauen mit GitHub-Remote, getrennten Dev/Live-Environments, CI und Docs, ohne kirchenki.com für Pilot-Kirchen zu unterbrechen.

**Architecture:** Zwei langlebige Branches (`main` = Live, `develop` = Dev). Zwei Netlify-Sites, zwei Supabase-Projekte. GitHub Actions für CI (Lint/Build/Typecheck). Deploys auto via Netlify. Secrets manuell pro Environment in Netlify/Supabase-UIs.

**Tech Stack:** Git + GitHub, Netlify, Supabase, n8n Cloud (vorübergehend), Render (Accounts-Prep), GitHub Actions, React/Vite/TypeScript (bestehend), Python/FastAPI (bestehend).

**Spec:** `docs/superpowers/specs/2026-04-16-monorepo-dev-live-foundation-design.md`

---

## File Structure

**Neu erstellt im Repo:**
- `.github/workflows/ci.yml` — CI-Pipeline: Lint + Build + Typecheck auf jedem PR
- `README.md` — Setup-Anleitung für neue Entwickler (Root-Level)
- `.env.example` — Template für alle Env-Vars, mit Dummy-Werten
- `docs/decisions/ADR-001-monorepo-dev-live.md` — Zusammenfassung der Architektur-Entscheidung
- `supabase/migrations/YYYYMMDD_schema_baseline.sql` — nur falls existierende Migrations unvollständig sind
- `supabase/seed.sql` — optionales Seed-Script für Dev-Supabase

**Modifiziert im Repo:**
- `CLAUDE.md` — Branch-Realität dokumentieren (nicht nur Ziel)

**Externe Konfiguration (nicht im Repo):**
- GitHub: neues privates Repo, Branch-Protection-Rules
- Netlify: Prod-Site-Umlink, neue Dev-Site
- Supabase: neues Dev-Projekt, Schema-Sync, Env-Vars
- DNS-Provider: CNAME für dev.kirchenki.com
- n8n Cloud: Workflow-Duplikat "KirchenKI DEV"
- Render: Co-Founder als Team-Mitglied

---

## Execution-Reihenfolge

**Phase 1** muss zuerst. Danach sind Phase 3, 4 unabhängig (können parallel). **Phase 2** zuletzt (wenn alles stabil). Phase 5 deferred/unwichtig.

Empfohlene Reihenfolge für heute/morgen:
1. Phase 1 (alle Tasks, sequentiell)
2. Phase 4 (CI + Docs)
3. Phase 3 (Dev-Env, braucht Supabase-Zugriff)
4. Phase 2 (Netlify-Switch, koordiniert mit Co-Founder)
5. Phase 5 (5-Min-Klick, irgendwann)

---

## Phase 1: GitHub-Repo & Branches

### Task 1.1: Neues GitHub-Repo anlegen

**Files:** Keine (externe Action)

- [ ] **Step 1: In GitHub einloggen**

Mit dem neuen Shared-Account auf github.com einloggen (Gmail-basiert).

- [ ] **Step 2: Neues Repo erstellen**

Rechts oben "+" → "New repository". Settings:
- **Owner**: Der neue Shared-Account
- **Repository name**: `kirchenki`
- **Description**: `KirchenKI Monorepo — Frontend, Backend-Services, Supabase, Infrastructure`
- **Visibility**: **Private**
- **Initialize**: KEINE Auswahl ankreuzen (kein README, kein .gitignore, keine License — das haben wir lokal schon)

Klick "Create repository".

- [ ] **Step 3: Remote-URL notieren**

Die URL sieht so aus: `https://github.com/<account-name>/kirchenki.git`

Diese URL brauchst du im nächsten Task.

---

### Task 1.2: Uncommitted V2-Arbeit stashen

**Files:**
- Arbeitet mit: Aktuelle uncommitted Changes in `apps/web/`

- [ ] **Step 1: Sicherstellen dass man auf main ist**

```bash
cd "/c/Users/Jann Brunken/KirchenKi"
git status
```

Expected: `On branch main`, plus die 5 untracked + 4 modified Files.

- [ ] **Step 2: Alle uncommitted Changes stashen (inklusive untracked)**

```bash
git stash push -u -m "V2 sprint work - landing + tool redesign"
```

Expected: `Saved working directory and index state On main: V2 sprint work...`

- [ ] **Step 3: Sauberen Stand verifizieren**

```bash
git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 4: Stash-Inhalt zur Kontrolle auflisten**

```bash
git stash list
```

Expected: Eine Zeile, z.B. `stash@{0}: On main: V2 sprint work - landing + tool redesign`

---

### Task 1.3: Lokales main zum neuen Remote pushen

**Files:** Keine (Git-Operation)

- [ ] **Step 1: Remote hinzufügen**

URL aus Task 1.1 verwenden:

```bash
git remote add origin https://github.com/<account-name>/kirchenki.git
```

- [ ] **Step 2: Remote-Config verifizieren**

```bash
git remote -v
```

Expected:
```
origin  https://github.com/<account-name>/kirchenki.git (fetch)
origin  https://github.com/<account-name>/kirchenki.git (push)
```

- [ ] **Step 3: main pushen**

```bash
git push -u origin main
```

Expected: Upload der beiden Commits `629ad3f` und `3e9228d`, plus Message "Branch 'main' set up to track 'origin/main'".

Falls nach Credentials gefragt wird: GitHub Username + Personal Access Token (PAT), NICHT Passwort. PAT erstellt man unter GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token, Scope: `repo`.

- [ ] **Step 4: Push verifizieren**

In GitHub-UI auf Repo gehen, die 2 Commits müssen in der History sichtbar sein.

---

### Task 1.4: develop-Branch erstellen und pushen

**Files:** Keine (Git-Operation)

- [ ] **Step 1: develop von main abzweigen**

```bash
git checkout -b develop
```

Expected: `Switched to a new branch 'develop'`

- [ ] **Step 2: develop pushen**

```bash
git push -u origin develop
```

Expected: `Branch 'develop' set up to track 'origin/develop'`

---

### Task 1.5: V2-Arbeit aus Stash holen und auf develop committen

**Files:**
- Bringt zurück: 5 untracked + 4 modified Files in `apps/web/`

- [ ] **Step 1: Auf develop-Branch bleiben und Stash popen**

```bash
git status  # muss "On branch develop" zeigen
git stash pop
```

Expected: Files sind wieder da als untracked/modified, Stash ist weg.

- [ ] **Step 2: Alles stagen**

```bash
git add apps/web/
```

- [ ] **Step 3: Verifizieren was gestaged ist**

```bash
git status
```

Expected: Alle 9 Files unter "Changes to be committed:" (5 new file, 4 modified).

- [ ] **Step 4: Committen**

```bash
git commit -m "feat(web): V2 landing + tool redesign with tabs + social media beta"
```

- [ ] **Step 5: Nach GitHub pushen**

```bash
git push
```

Expected: Commit erscheint auf develop-Branch in GitHub.

---

### Task 1.6: Branch-Protection-Rules setzen

**Files:** Keine (externe GitHub-UI-Config)

- [ ] **Step 1: In GitHub zu Repo Settings gehen**

`github.com/<account>/kirchenki/settings/branches`

- [ ] **Step 2: Protection-Rule für main anlegen**

"Add branch protection rule" klicken:
- **Branch name pattern**: `main`
- ☑ Require a pull request before merging
  - ☐ Require approvals (LEER lassen — Shared-Account macht Self-Approvals sinnlos)
- ☑ Require status checks to pass before merging
  - Status-Check-Liste wird leer sein, weil CI noch nicht läuft — das fügen wir nach Phase 4 hinzu
- ☐ Require conversation resolution before merging (optional)
- ☐ Require signed commits (optional)
- ☑ Do not allow bypassing the above settings (wichtig)
- ☐ Allow force pushes (AUS lassen)
- ☐ Allow deletions (AUS lassen)

"Create" klicken.

- [ ] **Step 3: Protection-Rule für develop anlegen**

Nochmal "Add branch protection rule":
- **Branch name pattern**: `develop`
- ☐ Require a pull request before merging (direkte Pushes erlaubt)
- ☑ Require status checks to pass before merging (wenn CI live ist)
- ☐ Allow force pushes
- ☐ Allow deletions

"Create" klicken.

- [ ] **Step 4: Verifizieren**

Auf `/settings/branches` müssen jetzt 2 Regeln angezeigt sein: `main` und `develop`.

---

## Phase 4: CI & Docs

### Task 4.1: GitHub Actions CI-Workflow erstellen

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Feature-Branch erstellen (von develop)**

```bash
cd "/c/Users/Jann Brunken/KirchenKi"
git checkout develop
git pull
git checkout -b feature/ci-and-docs
```

- [ ] **Step 2: Directory anlegen**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 3: ci.yml schreiben**

Inhalt für `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

jobs:
  frontend:
    name: Frontend (apps/web)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/web/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "chore(ci): add GitHub Actions for frontend lint/typecheck/build"
```

---

### Task 4.2: .env.example schreiben

**Files:**
- Create: `.env.example` (im Repo-Root)

- [ ] **Step 1: .env.example anlegen**

Inhalt für `.env.example`:

```bash
# ==============================================================================
# KirchenKI — Environment Variables Template
# ==============================================================================
#
# So benutzt du diese Datei:
#   1. Kopiere sie: cp .env.example .env
#   2. Fülle die Werte mit deinen eigenen Credentials
#   3. .env ist gitignored und wird nie committed
#
# Für Dev-Environment (dev.kirchenki.com): Werte von kirchenki-dev Supabase
# Für Prod-Environment (kirchenki.com): Werte von Production-Supabase
#
# Diese Env-Vars werden produktiv in Netlify/Render-UIs gepflegt,
# NICHT in dieser Datei.
# ==============================================================================

# ------------------------------------------------------------------------------
# Frontend (apps/web/) — Vite env vars, alle mit VITE_ prefix
# ------------------------------------------------------------------------------
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-public-key>

# ------------------------------------------------------------------------------
# Backend Social Media Service (services/social-media/) — nur lokal benötigt
# ------------------------------------------------------------------------------
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...

# Optional: Whisper-Modellgröße (default: base)
# Möglich: tiny, base, small, medium, large-v3
WHISPER_MODEL=base

# ------------------------------------------------------------------------------
# Supabase CLI (für Schema-Migrations, nur lokal benötigt)
# ------------------------------------------------------------------------------
# Supabase Project Ref (aus Dashboard → Project Settings → General)
SUPABASE_PROJECT_ID=<project-ref>

# Supabase Service Role Key (NICHT der anon key — aus Project Settings → API)
# ACHTUNG: Dieser Key hat Admin-Rechte auf die DB, nie ins Frontend
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example template for local setup"
```

---

### Task 4.3: README.md schreiben

**Files:**
- Create: `README.md` (im Repo-Root)

- [ ] **Step 1: README.md anlegen**

Inhalt für `README.md`:

```markdown
# KirchenKI

Monorepo für die KirchenKI-Plattform — SaaS für deutschsprachige Kirchen, das aus Predigten automatisch Kleingruppen-Materialien und Social-Media-Content generiert.

---

## Struktur

```
apps/web/              # React-Frontend (Vite + TypeScript + Tailwind + shadcn/ui)
services/
  social-media/        # Python FastAPI Service (Whisper + GPT-4o + Replicate)
supabase/
  migrations/          # DB-Schema-Versionierung
  functions/           # Edge Functions
n8n/                   # Versionierter n8n-Workflow (wird später migriert)
docs/                  # Specs, ADRs, Setup-Guides
```

---

## Environments

| Branch    | Environment | URL                  | Supabase               |
|-----------|-------------|----------------------|------------------------|
| `main`    | Production  | kirchenki.com        | kirchenki (prod)       |
| `develop` | Development | dev.kirchenki.com    | kirchenki-dev          |

Feature-Branches (`feature/xyz`) bekommen automatische Netlify-Preview-URLs.

---

## Lokales Setup

### Voraussetzungen

- Node.js 20+
- Python 3.11+ (nur falls am Social-Media-Service gearbeitet wird)
- Git
- Supabase CLI (nur für Schema-Migrations): https://supabase.com/docs/guides/cli

### Erste Schritte

```bash
# Repo clonen
git clone https://github.com/<account>/kirchenki.git
cd kirchenki

# Env-Vars einrichten
cp .env.example .env
# .env bearbeiten mit echten Credentials (fragt euch gegenseitig)

# Frontend-Dependencies installieren und Dev-Server starten
cd apps/web
npm install
npm run dev
# Läuft auf http://localhost:8080
```

### Optional: Python-Service lokal

```bash
cd services/social-media
python -m venv venv
source venv/bin/activate  # oder: venv\Scripts\activate auf Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Workflow

### Feature entwickeln

```bash
git checkout develop
git pull
git checkout -b feature/my-new-thing

# ... arbeiten ...

git add .
git commit -m "feat(web): add my new thing"
git push -u origin feature/my-new-thing
```

Dann auf GitHub PR gegen `develop` öffnen. Netlify baut eine Preview-URL, CI läuft.
Nach Merge landet der Code auf dev.kirchenki.com.

### Release auf Production

PR von `develop` → `main` öffnen. Nach Merge landet der Code auf kirchenki.com.

---

## Branch-Konventionen

- `main` — Production, Netlify Auto-Deploy zu kirchenki.com
- `develop` — Dev-Integration, Netlify Auto-Deploy zu dev.kirchenki.com
- `feature/<name>` — Feature-Arbeit, Netlify-Preview-URL
- `fix/<name>` — Bugfixes
- `chore/<name>` — Infrastruktur, Docs, CI

Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`

---

## Weitere Docs

- `CLAUDE.md` — Projekt-Kontext für Claude Code
- `docs/SETUP_GUIDE.md` — Ausführliche Roadmap
- `docs/superpowers/specs/` — Architektur-Designs
- `docs/decisions/` — ADRs (Architecture Decision Records)
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup instructions and workflow"
```

---

### Task 4.4: CLAUDE.md aktualisieren

**Files:**
- Modify: `CLAUDE.md` (Branch-Sektion)

- [ ] **Step 1: Aktuellen Inhalt lesen**

Der existierende Abschnitt "Branch-Konvention" (ab ca. Zeile 105) ist:

```markdown
## Branch-Konvention

- `main` – produktiv, Netlify Auto-Deploy
- `develop` – Integration
- `feature/website-relaunch` – Track A
- `feature/social-media-module` – Track B
- Conventional Commits: feat:, fix:, refactor:, docs:, chore:
```

- [ ] **Step 2: Diesen Abschnitt ersetzen**

Neuer Inhalt für die Branch-Konvention-Sektion:

```markdown
## Branch-Strategie & Environments

| Branch    | Environment | Auto-Deploy zu      |
|-----------|-------------|---------------------|
| `main`    | Production  | kirchenki.com       |
| `develop` | Development | dev.kirchenki.com   |
| `feature/*` | Preview   | Netlify Deploy Preview URL |

**Flow:** `feature/xyz` → PR → `develop` (CI muss grün sein) → PR → `main` (CI muss grün sein).

**Branch-Protection:**
- `main`: PR erforderlich, CI erforderlich, keine Force-Pushes
- `develop`: Direkte Pushes erlaubt, CI erforderlich, keine Force-Pushes
- Approvals sind NICHT erforderlich (Shared-GitHub-Account)

**Commits:** Conventional Commits — `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): update branch strategy to reflect dev/live reality"
```

---

### Task 4.5: ADR-001 schreiben

**Files:**
- Create: `docs/decisions/ADR-001-monorepo-dev-live.md`

- [ ] **Step 1: Directory erstellen**

```bash
mkdir -p docs/decisions
```

- [ ] **Step 2: ADR schreiben**

Inhalt für `docs/decisions/ADR-001-monorepo-dev-live.md`:

```markdown
# ADR-001: Monorepo mit Dev/Live-Environments

**Datum:** 2026-04-16
**Status:** Accepted
**Spec:** [2026-04-16-monorepo-dev-live-foundation-design.md](../superpowers/specs/2026-04-16-monorepo-dev-live-foundation-design.md)

## Kontext

KirchenKI hatte ursprünglich getrennte Repos für Frontend und Social-Media-Prototyp, ohne strukturiertes Dev/Live-Setup. Für produktive Zusammenarbeit zu zweit und das geplante Wachstum (weitere Features, Migration weg von n8n) brauchte es eine Foundation.

## Entscheidung

1. **Ein Monorepo** auf GitHub mit `apps/`, `services/`, `supabase/`, `n8n/`, `docs/`-Struktur.
2. **Zwei langlebige Branches**: `main` = Production, `develop` = Development.
3. **Zwei Netlify-Sites** (Prod + Dev), **zwei Supabase-Projekte** (Prod + Dev).
4. **Kein Monorepo-Tool** (Turborepo, pnpm-workspaces): jede App / jeder Service hat eigene Dependencies.
5. **GitHub Actions** nur für Lint/Build/Typecheck, Deployment via Netlify/Render Auto-Deploy.
6. **Shared GitHub-Account**: Beide Co-Founder nutzen denselben Account, daher keine PR-Approval-Pflicht.
7. **Secrets** manuell in Netlify/Render/Supabase-UIs, kein zentraler Store.

## Alternativen

- **Multi-Repo**: Separate Repos pro App/Service — zu viel Overhead für 2-Personen-Team.
- **Turborepo/pnpm-workspaces**: Shared Code via Packages — YAGNI, wenn nicht absehbar Shared-Code-Bedarf ist.
- **Trunk-based Development** mit nur `main`: Weniger Safety-Net bei DB-Migrations, riskanter für Prod.
- **Supabase Branching** statt separater Projekte: Beta-unreliable.

## Konsequenzen

**Positiv:**
- Klare Trennung Prod/Dev, sichere Schema-Änderungen
- Beide Co-Founder können parallel arbeiten ohne sich zu stören
- Erweiterbar für mehr Features (Option 1 aus Spec)

**Negativ:**
- Doppelter Pflegeaufwand (2x Netlify, 2x Supabase, 2x Render)
- Secrets in verschiedenen UIs gepflegt — bei Rotation aufwändiger
- Keine Git-History für `apps/web` aus dem alten Repo (Variante B der Migration)

## Nachfolge-Entscheidungen

- **ADR-002** (geplant): n8n → Render Migration — eigene Entscheidung, eigener Spec.
- **ADR-003** (geplant): Feature-Entitlements — wenn erste Zusatz-Tools definiert sind.
```

- [ ] **Step 3: Commit**

```bash
git add docs/decisions/ADR-001-monorepo-dev-live.md
git commit -m "docs(adr): add ADR-001 for monorepo dev/live decision"
```

---

### Task 4.6: Supabase Edge Functions lokal versionieren

**Files:**
- Evtl. Create: `supabase/functions/<function-name>/index.ts` (und weitere)

- [ ] **Step 1: Prüfen ob functions/ lokal bereits befüllt ist**

```bash
cd "/c/Users/Jann Brunken/KirchenKi"
ls supabase/functions/ 2>/dev/null
```

**Falls schon Funktionen vorhanden**: Skip zu Task 4.7.

**Falls leer/nicht vorhanden**: weiter mit Step 2.

- [ ] **Step 2: Supabase CLI auf Prod-Projekt zeigen (nur lesend)**

```bash
supabase link --project-ref <prod-project-ref>
```

- [ ] **Step 3: Edge Functions lokal pullen**

Supabase CLI kann Funktionen nicht direkt "pullen". Stattdessen: bekannte Funktionen einzeln via Code-Copy aus Dashboard holen.

Im Supabase Dashboard (Prod) → Edge Functions:
- Liste aller existierenden Functions notieren (mindestens `generate-materials` laut CLAUDE.md)
- Pro Function: Code aus dem Editor in eine lokale Datei `supabase/functions/<name>/index.ts` kopieren
- Auch `deno.json` / `import_map.json` übernehmen falls vorhanden

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/
git commit -m "chore(supabase): version edge functions locally"
```

- [ ] **Step 5: Functions auf Dev-Supabase deployen**

```bash
supabase link --project-ref <dev-project-ref>
supabase functions deploy generate-materials
# für weitere Functions analog
```

- [ ] **Step 6: Env-Vars der Edge Functions auf Dev konfigurieren**

Im Supabase-Dashboard (Dev-Projekt) → Edge Functions → <function-name> → "Secrets":
- Alle Env-Vars prüfen, die in Prod gesetzt sind (z.B. `N8N_WEBHOOK_URL`, `OPENAI_API_KEY`)
- Diese auf Dev-Werte setzen (z.B. `N8N_WEBHOOK_URL` auf Dev-Workflow-URL aus Task 3.8)

---

### Task 4.7: PR für CI + Docs öffnen und mergen

**Files:** Keine (GitHub-UI)

- [ ] **Step 1: Feature-Branch pushen**

```bash
git push -u origin feature/ci-and-docs
```

- [ ] **Step 2: PR auf GitHub öffnen**

Auf `github.com/<account>/kirchenki/pulls` → "New pull request":
- **base**: `develop`
- **compare**: `feature/ci-and-docs`
- **Title**: `chore: CI pipeline + README + ADR-001`
- **Description**: Kurz auflisten was drin ist

PR erstellen.

- [ ] **Step 3: CI-Run abwarten**

Der CI-Workflow wird durch diesen PR zum ersten Mal laufen. Auf dem PR erscheint unten der "Checks"-Bereich.
- Falls ci.yml syntaktisch korrekt ist: grüner Haken
- Falls lint/typecheck/build durchlaufen: komplett grün
- Falls Fehler: Logs durchgehen, fixen, neuer Commit pushen

- [ ] **Step 4: PR mergen**

"Merge pull request" klicken → "Confirm merge". Wählen: "Create a merge commit" (Default ok).

- [ ] **Step 5: Feature-Branch löschen**

Nach Merge bietet GitHub "Delete branch" an — klicken. Oder lokal:

```bash
git checkout develop
git pull
git branch -d feature/ci-and-docs
git push origin --delete feature/ci-and-docs
```

- [ ] **Step 6: Branch-Protection für main/develop um CI erweitern**

Jetzt wo CI einmal gelaufen ist, erscheint der Check-Name ("Frontend (apps/web)") in der Branch-Protection-UI:
- `github.com/<account>/kirchenki/settings/branches`
- Regel für `main` editieren → "Require status checks to pass" → "Add checks" → `Frontend (apps/web)` auswählen
- Selbes für `develop`

---

## Phase 3: Dev-Environment aufbauen

### Task 3.1: Supabase-Dev-Projekt erstellen

**Files:** Keine (externe Supabase-UI)

- [ ] **Step 1: In Supabase-Dashboard einloggen**

app.supabase.com — mit Account einloggen, der Zugriff auf den Prod-Supabase hat.

- [ ] **Step 2: Neues Projekt erstellen**

"New project" klicken:
- **Name**: `kirchenki-dev`
- **Database Password**: Sicheres Passwort generieren, SOFORT in 1Password/Signal-Notiz-an-sich-selbst speichern
- **Region**: Gleiche wie Prod (vermutlich Frankfurt/eu-central-1)
- **Pricing Plan**: Free Tier reicht für Dev

Klick "Create new project". Dauert ~2 Minuten bis Projekt ready ist.

- [ ] **Step 3: Project Ref und Keys notieren**

In Project Settings → API:
- **Project URL**: `https://<project-ref>.supabase.co` — notieren
- **anon public key** — notieren
- **service_role secret key** — notieren (sensitiv, nur für Admin-Zwecke)

Diese Werte brauchst du in Task 3.5 und 3.7.

---

### Task 3.2: Schema-Sync-Check (Prod-Schema in migrations?)

**Files:**
- Read: `supabase/migrations/`
- Evtl. Create: `supabase/migrations/<YYYYMMDD>_schema_baseline.sql`

- [ ] **Step 1: Aktuelle Migrations auflisten**

```bash
cd "/c/Users/Jann Brunken/KirchenKi"
ls -la supabase/migrations/
```

Notieren, was drin ist.

- [ ] **Step 2: Prod-Schema aus Dashboard ziehen**

In Supabase (Prod-Projekt) → SQL Editor → neue Query:

```sql
-- Schema-Dump aller User-Tables (ohne Daten)
SELECT
  'CREATE TABLE ' || table_schema || '.' || table_name || ' (...);'
FROM information_schema.tables
WHERE table_schema = 'public';
```

Besser: **Supabase Dashboard → Database → Schema Visualizer** anschauen und Liste aller Tabellen mit Columns notieren.

- [ ] **Step 3: Vergleichen**

Tabellen in `supabase/migrations/*.sql` vs. Tabellen in Prod-Supabase.

**Falls migrations vollständig sind** (alle Prod-Tables per Migration erzeugt): weiter zu Task 3.3.

**Falls Migrations lückenhaft sind** (einige Tables nur via Supabase-UI erstellt):

- [ ] **Step 4: Baseline-Migration aus Prod ziehen (nur falls Lücken)**

Via Supabase CLI:

```bash
supabase login
supabase link --project-ref <prod-project-ref>
supabase db pull
```

Das erzeugt eine Migration-Datei unter `supabase/migrations/<timestamp>_remote_schema.sql` mit dem aktuellen Prod-Schema als Baseline.

- [ ] **Step 5: Falls Baseline erzeugt: committen**

Auf Feature-Branch (`feature/supabase-baseline` oder ähnlich):

```bash
git add supabase/migrations/
git commit -m "chore(supabase): add schema baseline from prod"
git push -u origin feature/supabase-baseline
```

PR gegen develop, mergen. Ebenso ein PR gegen main später, weil main sollte immer den gleichen Schema-Stand haben.

---

### Task 3.3: Schema auf Dev-Supabase anwenden

**Files:** Keine (externe DB-Action)

- [ ] **Step 1: Supabase CLI auf Dev-Projekt zeigen**

```bash
cd "/c/Users/Jann Brunken/KirchenKi"
supabase link --project-ref <dev-project-ref>
```

Achtung: `<dev-project-ref>` ist das neue kirchenki-dev, NICHT Prod!

- [ ] **Step 2: Migrations auf Dev pushen**

```bash
supabase db push
```

Supabase wendet alle Migrations aus `supabase/migrations/` auf Dev an.

- [ ] **Step 3: Verifizieren**

Im Supabase-Dashboard (Dev-Projekt) → Database → Tables: alle erwarteten Tables müssen da sein (user_settings, sermons, generated_materials, etc.).

---

### Task 3.4: Seed-Daten für Dev-Supabase (optional)

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Feature-Branch erstellen**

```bash
git checkout develop
git pull
git checkout -b chore/dev-seed
```

- [ ] **Step 2: seed.sql schreiben**

Inhalt für `supabase/seed.sql`:

```sql
-- ==============================================================================
-- KirchenKI Dev Seed Data
-- ==============================================================================
--
-- Minimales Seed-Script für dev.kirchenki.com.
-- NICHT auf Prod laufen lassen!
--
-- Enthält nur Dummy-Daten, keine realen User-Infos.
-- ==============================================================================

-- WICHTIG: Test-User muss vorher manuell via Supabase Auth UI erstellt werden:
-- Dev-Supabase → Authentication → Users → "Add user"
-- Email: test@kirchenki-dev.com, Passwort nach Wahl
-- Nach dem Anlegen: User-ID kopieren und unten einsetzen.

-- Ersetze '00000000-0000-0000-0000-000000000000' durch echte User-ID
-- nachdem du den Test-User angelegt hast.

INSERT INTO user_settings (user_id, sermon_credits, created_at)
VALUES ('00000000-0000-0000-0000-000000000000', 4, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Fake-Predigt für UI-Tests
INSERT INTO sermons (
  user_id,
  title,
  preacher,
  date_preached,
  full_text,
  status,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Test-Predigt: Lukas 15 - Der verlorene Sohn',
  'Test-Pastor',
  CURRENT_DATE,
  'Dies ist ein Fake-Predigt-Text für Dev-Umgebung. Lorem ipsum...',
  'processed',
  NOW()
) ON CONFLICT DO NOTHING;

-- Erfolgsmeldung
DO $$
BEGIN
  RAISE NOTICE 'Dev seed applied successfully';
END $$;
```

- [ ] **Step 3: Commit und mergen via PR**

```bash
git add supabase/seed.sql
git commit -m "chore(supabase): add dev seed script"
git push -u origin chore/dev-seed
```

PR gegen develop, mergen.

- [ ] **Step 4: Seed auf Dev-Supabase anwenden (manuell)**

- Erst: Test-User in Supabase Dashboard (Dev) → Authentication → Users anlegen
- User-ID kopieren
- In `seed.sql` die `00000000-...` durch echte User-ID ersetzen (lokale Edit, NICHT committen)
- Im Supabase-Dashboard (Dev) → SQL Editor → seed.sql-Inhalt reinpasten, "Run"

Expected: "Dev seed applied successfully" in der Console.

---

### Task 3.5: Netlify Dev-Site erstellen

**Files:** Keine (Netlify-UI)

- [ ] **Step 1: In Netlify einloggen**

app.netlify.com

- [ ] **Step 2: Neue Site erstellen**

"Add new site" → "Import an existing project" → "Deploy with GitHub":
- GitHub-Account autorisieren falls nötig
- Repository auswählen: `kirchenki`
- **Branch to deploy**: `develop`
- **Base directory**: `apps/web`
- **Build command**: `npm run build`
- **Publish directory**: `apps/web/dist` (oder nur `dist` wenn Netlify von Base-Dir aus rechnet)

"Deploy site" klicken. Erster Build wird fehlschlagen, weil Env-Vars noch fehlen — das ist ok.

- [ ] **Step 3: Site-Name anpassen**

Nach erstem Build: Site Settings → Change site name → z.B. `kirchenki-dev`.

Interne URL wird dann: `kirchenki-dev.netlify.app`.

---

### Task 3.6: Custom Domain dev.kirchenki.com einrichten

**Files:** Keine (DNS + Netlify)

- [ ] **Step 1: In Netlify Custom Domain hinzufügen**

Dev-Site → Domain management → "Add custom domain" → `dev.kirchenki.com` → "Verify" → "Yes, add domain".

- [ ] **Step 2: DNS-Einträge beim Domain-Provider anlegen**

Wo die kirchenki.com Domain registriert ist (Netlify, Ionos, Strato, whatever):
- DNS-Management öffnen
- Neuen Eintrag hinzufügen:
  - **Type**: CNAME
  - **Host/Name**: `dev` (subdomain)
  - **Value/Target**: `kirchenki-dev.netlify.app` (die interne Netlify-URL)
  - **TTL**: 3600 (oder Default)

Speichern.

- [ ] **Step 3: DNS-Propagation abwarten und verifizieren**

Kann 5-60 Minuten dauern:

```bash
nslookup dev.kirchenki.com
```

Wenn die Antwort auf Netlify zeigt: weiter.

In Netlify-UI unter Domain management zeigt der Status irgendwann "Netlify DNS" oder "OK" mit grünem Haken. Netlify generiert automatisch ein Let's Encrypt SSL-Zertifikat.

---

### Task 3.7: Dev-Env-Vars in Netlify setzen

**Files:** Keine (Netlify-UI)

- [ ] **Step 1: Dev-Site → Site settings → Environment variables**

- [ ] **Step 2: Für jeden Env-Var klicken "Add a variable"**

- **Key**: `VITE_SUPABASE_URL`
  **Value**: `https://<dev-project-ref>.supabase.co` (aus Task 3.1)
  **Scopes**: Alle

- **Key**: `VITE_SUPABASE_ANON_KEY`
  **Value**: anon public key aus Dev-Supabase (aus Task 3.1)
  **Scopes**: Alle

- [ ] **Step 3: Redeploy triggern**

Dev-Site → Deploys → "Trigger deploy" → "Deploy site"

Expected: Build läuft durch, dev.kirchenki.com zeigt die V2-Landing (aus develop).

- [ ] **Step 4: Funktionstest**

- `https://dev.kirchenki.com` öffnen → Landing muss laden
- Versuchen, dich mit dem in Task 3.4 angelegten Test-User einzuloggen
- Tool-Seite öffnen, Upload-Feld muss erscheinen (Upload selbst noch nicht funktional, weil Backend-Webhooks noch Dev-Instanz brauchen — das ist erst nach Phase 2 relevant)

---

### Task 3.8: n8n-Workflow duplizieren als DEV

**Files:** Keine (n8n-Cloud-UI)

- [ ] **Step 1: In n8n Cloud einloggen**

kirchenki.app.n8n.cloud

- [ ] **Step 2: Bestehenden Workflow duplizieren**

Im Workflow-Übersicht: Bestehenden Workflow öffnen → Menü (3-Punkte) → "Duplicate".

- [ ] **Step 3: Umbenennen**

Name des Duplikats: `KirchenKI DEV`.

- [ ] **Step 4: Webhook-URLs wechseln**

Im Workflow alle Nodes durchgehen, die Supabase-Credentials nutzen:
- Supabase-Nodes: Credentials auf eine NEUE Credential umstellen (in n8n: Credentials → New → Supabase → Dev-Credentials eintragen)
- Gmail-Nodes: auf eine Test-Mail-Adresse umstellen, damit keine Fake-Materials an echte Gruppen gehen

- [ ] **Step 5: Workflow-Webhook-URL notieren**

Der Trigger-Node hat eine eigene Webhook-URL für diesen Dev-Workflow. Diese URL muss später in der Dev-Supabase-Edge-Function als Ziel eingetragen werden.

- [ ] **Step 6: Aktivieren**

Workflow → "Active" toggle.

---

## Phase 2: Live Netlify Switch

**⚠ WICHTIG: Diese Phase erst starten, wenn Phase 1, 3, 4 stabil sind. Mit Co-Founder absprechen, idealerweise außerhalb der Haupt-Nutzungszeit der Pilot-Kirchen (z.B. Samstagabend).**

### Task 2.1: Verifizieren dass main = aktueller Live-Stand

**Files:**
- Read: `apps/web/` lokal und im alten Repo

- [ ] **Step 1: Welches ist das "alte" Repo?**

Herausfinden: In Netlify → aktuelle Prod-Site → Site settings → Build & Deploy → "Repository": zeigt den aktuellen Repo-Namen.

- [ ] **Step 2: Alten Repo-Stand lokal clonen (in einen anderen Ordner!)**

```bash
cd /c/Users
git clone <alter-repo-url> kirchenki-old-for-diff
```

- [ ] **Step 3: Diff gegen apps/web im neuen Monorepo**

```bash
diff -r "/c/Users/kirchenki-old-for-diff/" "/c/Users/Jann Brunken/KirchenKi/apps/web/" | head -50
```

Expected: Entweder gar keine Diffs, oder nur "Only in X" für Dateien wie `.git`, `node_modules`, Monorepo-Meta. Echte Code-Diffs müssen LEER sein.

- [ ] **Step 4: Falls echte Diffs existieren**

Entweder:
- Alter Repo hat Commits, die nicht im neuen sind → diese in `apps/web/` übernehmen, commit auf `main`, push
- Oder: Unterschiede sind bewusst (weil wir Monorepo-Dinge hinzugefügt haben wie CLAUDE.md, docs/) → dann ist `apps/web/` intakt und wir sind safe

Wichtig: `main` in `apps/web/` muss nach Task 2.1 byte-identisch zum aktuellen Live-Stand sein.

- [ ] **Step 5: Aufräumen**

```bash
rm -rf /c/Users/kirchenki-old-for-diff
```

---

### Task 2.2: Netlify Prod-Site auf neues Repo umlinken

**Files:** Keine (Netlify-UI)

- [ ] **Step 1: Vorher-Backup-Check**

In Netlify Prod-Site → Deploys: aktuellen "Published" Deploy notieren (Deploy-ID), damit Rollback im Fehlerfall möglich.

- [ ] **Step 2: In Netlify Prod-Site → Site settings → Build & Deploy → Continuous deployment**

Unter "Repository": "Manage repository" oder "Link to a different repository" klicken.

- [ ] **Step 3: Neues Repo auswählen**

- Repo: `kirchenki` (der neue Shared-Account)
- **Branch to deploy**: `main`
- **Base directory**: `apps/web`
- **Build command**: `npm run build`
- **Publish directory**: `apps/web/dist` (oder relativ: `dist`)

"Save" klicken.

- [ ] **Step 4: Env-Vars prüfen**

Env-Vars sollten aus dem alten Setup übernommen worden sein (Netlify behält die bei Repo-Link-Switch normalerweise). Zur Sicherheit in Site settings → Environment variables prüfen:
- `VITE_SUPABASE_URL` muss Prod-Supabase-URL sein (NICHT kirchenki-dev!)
- `VITE_SUPABASE_ANON_KEY` muss Prod-anon-Key sein

Falls fehlen: aus 1Password/Signal-Notizen nachtragen.

- [ ] **Step 5: Trigger deploy**

Deploys → "Trigger deploy" → "Deploy site".

- [ ] **Step 6: Deploy verifizieren**

- Deploy-Log durchscrollen: Build muss grün sein
- Nach erfolgreichem Deploy: kirchenki.com im Inkognito-Fenster öffnen
- Visueller Abgleich: muss exakt wie vorher aussehen (alte Landing, altes Tool)
- Login mit einem Pilot-Account (oder Test-Account): muss funktionieren

**Falls Deploy fehlschlägt ODER kirchenki.com anders aussieht:**
- Sofort Rollback: Deploys → bei dem alten Published-Deploy (aus Task 2.2 Step 1) → "Publish deploy"
- Netlify-Repo-Link wieder auf altes Repo zurücksetzen
- Fehleranalyse, dann nochmal versuchen

---

### Task 2.3: Altes Repo archivieren

**Files:** Keine (GitHub-UI)

- [ ] **Step 1: 24h warten**

Nach erfolgreichem Switch: mindestens 24 Stunden live laufen lassen, ohne Incidents.

- [ ] **Step 2: Auf altem Repo → Settings → "Archive this repository"**

GitHub-UI → Settings → scroll down → "Danger Zone" → "Archive this repository".

Das Repo wird readonly, kein Löschen, bleibt als Backup lesbar.

---

## Phase 5: Render Team-Zugriff (minimal)

### Task 5.1: Co-Founder in Render-Team einladen

**Files:** Keine (Render-UI)

- [ ] **Step 1: Render-Dashboard**

dashboard.render.com mit dem Admin-Account einloggen.

- [ ] **Step 2: Team-Settings**

Account menu → Team → "Invite Member"

Email deines Co-Founders eintragen, Rolle: Admin (oder Developer).

- [ ] **Step 3: Co-Founder bestätigt**

Er bekommt Email, klickt "Accept invitation", ist drin.

---

## Completion Checklist

Nach allen Tasks ist erreicht:

- [ ] GitHub-Repo `kirchenki` existiert privat, beide Co-Founder haben Zugriff
- [ ] `main` und `develop` existieren mit Branch-Protection
- [ ] CI läuft auf jedem PR (Frontend Lint/Typecheck/Build)
- [ ] `README.md`, `.env.example`, `CLAUDE.md` aktualisiert, ADR-001 committed
- [ ] Dev-Supabase `kirchenki-dev` existiert mit Prod-gleichem Schema
- [ ] `dev.kirchenki.com` läuft, zeigt V2-Landing aus develop
- [ ] n8n Dev-Workflow-Duplikat existiert und ist aktiv
- [ ] kirchenki.com läuft aus dem neuen Repo, identisch wie vorher
- [ ] Altes Repo ist archiviert
- [ ] Co-Founder hat Render-Team-Zugriff

**Nächster Schritt danach:** Neuer Spec für **n8n → Render Migration**.
