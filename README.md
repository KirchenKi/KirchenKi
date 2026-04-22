# KirchenKI

Monorepo fuer die KirchenKI-Plattform — SaaS fuer deutschsprachige Kirchen,
das aus Predigten automatisch Kleingruppen-Materialien und Social-Media-Content
generiert.

---

## Struktur

```
apps/web/              # React-Frontend (Vite + TypeScript + Tailwind + shadcn/ui)
services/
  social-media/        # Python FastAPI Service (Whisper + GPT-4o + Replicate)
supabase/
  migrations/          # DB-Schema-Versionierung
  functions/           # Edge Functions (kommt in Phase 3)
n8n/                   # Versionierter n8n-Workflow (wird spaeter migriert)
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
- Supabase CLI (nur fuer Schema-Migrations): https://supabase.com/docs/guides/cli

### Erste Schritte

```bash
# Repo clonen
git clone https://github.com/KirchenKi/KirchenKi.git kirchenki
cd kirchenki

# Env-Vars einrichten
cp .env.example .env
# .env bearbeiten mit echten Credentials (fragt euch gegenseitig)

# Frontend-Dependencies installieren und Dev-Server starten
cd apps/web
npm install
npm run dev
# Laeuft auf http://localhost:8080
```

### Optional: Python-Service lokal

```bash
cd services/social-media
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows
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

Dann auf GitHub PR gegen `develop` oeffnen. Netlify baut eine Preview-URL,
CI laeuft (Lint + Typecheck + Build). Nach Merge landet der Code auf
dev.kirchenki.com.

### Release auf Production

PR von `develop` -> `main` oeffnen. Nach Merge landet der Code auf
kirchenki.com.

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

- `CLAUDE.md` — Projekt-Kontext fuer Claude Code
- `docs/SETUP_GUIDE.md` — Ausfuehrliche Roadmap
- `docs/superpowers/specs/` — Architektur-Designs
- `docs/decisions/` — ADRs (Architecture Decision Records)
