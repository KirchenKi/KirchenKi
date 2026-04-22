# ADR-001: Monorepo mit Dev/Live-Environments

**Datum:** 2026-04-16
**Status:** Accepted
**Spec:** [2026-04-16-monorepo-dev-live-foundation-design.md](../superpowers/specs/2026-04-16-monorepo-dev-live-foundation-design.md)

## Kontext

KirchenKI hatte urspruenglich getrennte Repos fuer Frontend und
Social-Media-Prototyp, ohne strukturiertes Dev/Live-Setup. Fuer produktive
Zusammenarbeit zu zweit und das geplante Wachstum (weitere Features,
Migration weg von n8n) brauchte es eine Foundation.

## Entscheidung

1. **Ein Monorepo** auf GitHub mit `apps/`, `services/`, `supabase/`, `n8n/`,
   `docs/`-Struktur.
2. **Zwei langlebige Branches**: `main` = Production, `develop` = Development.
3. **Zwei Netlify-Sites** (Prod + Dev), **zwei Supabase-Projekte** (Prod + Dev).
4. **Kein Monorepo-Tool** (Turborepo, pnpm-workspaces): jede App / jeder
   Service hat eigene Dependencies.
5. **GitHub Actions** nur fuer Lint/Build/Typecheck, Deployment via
   Netlify/Render Auto-Deploy.
6. **Shared GitHub-Account** (KirchenKi): beide Co-Founder als Collaborators
   mit persoenlichen Accounts. Daher keine PR-Approval-Pflicht.
7. **Secrets** manuell in Netlify/Render/Supabase-UIs, kein zentraler Store.

## Alternativen

- **Multi-Repo**: Separate Repos pro App/Service — zu viel Overhead fuer
  2-Personen-Team.
- **Turborepo/pnpm-workspaces**: Shared Code via Packages — YAGNI, wenn
  nicht absehbar Shared-Code-Bedarf ist.
- **Trunk-based Development** mit nur `main`: Weniger Safety-Net bei
  DB-Migrations, riskanter fuer Prod.
- **Supabase Branching** statt separater Projekte: Beta-unreliable.

## Konsequenzen

**Positiv:**
- Klare Trennung Prod/Dev, sichere Schema-Aenderungen
- Beide Co-Founder koennen parallel arbeiten ohne sich zu stoeren
- Erweiterbar fuer mehr Features (Option 1 aus Spec)

**Negativ:**
- Doppelter Pflegeaufwand (2x Netlify, 2x Supabase, 2x Render)
- Secrets in verschiedenen UIs gepflegt — bei Rotation aufwaendiger
- Keine Git-History fuer `apps/web` aus dem alten Repo (Variante B der
  Migration)

## Nachfolge-Entscheidungen

- **ADR-002** (geplant): n8n -> Render Migration — eigene Entscheidung,
  eigener Spec.
- **ADR-003** (geplant): Feature-Entitlements — wenn erste Zusatz-Tools
  definiert sind.
