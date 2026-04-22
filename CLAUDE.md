# CLAUDE.md – Projekt-Kontext für Claude Code

Diese Datei wird von Claude Code automatisch gelesen. Sie gibt Claude den Kontext, den es braucht, um produktiv am Projekt zu arbeiten, ohne jedes Mal nachfragen zu müssen.

---

## Projekt-Überblick

**KirchenKI** ist eine SaaS-Plattform für deutschsprachige Kirchen. Core-Feature: Predigten werden automatisch in altersspezifische Kleingruppen-Materialien verwandelt und per E-Mail an Gruppenleiter verteilt. Neues Feature (v2): Social-Media-Content aus Predigten (Clips, Zitat-Bilder, Captions).

**Zielmarkt:** DACH-Region, Fokus auf Freikirchen und Landeskirchen, ca. 60.000 potenzielle Kirchen.

**Pricing:** "Gemeinde-Plan" €49/Monat (4 Predigten inklusive, €9/weitere Predigt), 14-Tage-Trial ohne Kreditkarte.

**Current Traction:** 2 aktive Pilot-Kirchen, Outreach an ~10 weitere läuft.

---

## Tech Stack

### Frontend (`apps/web/`)
- React 18 + Vite + TypeScript
- Tailwind CSS 3.4 + shadcn/ui (Radix UI basiert)
- Font: Plus Jakarta Sans
- Routing: React Router v6 (mehrere Entry-Points: Landing, Tool, Dashboard, Settings)
- State: React Query (@tanstack/react-query)
- Animations: framer-motion (sparsam – Zielgruppe 40+)
- Deployment: Netlify

### Backend Materialien (n8n)
- n8n Workflow auf kirchenki.app.n8n.cloud
- Trigger: Supabase Edge Function generate-materials → n8n Webhook
- OpenAI GPT-5-mini (Analyse), GPT-5-nano (Altersgruppen-Agenten)
- Gmail-Versand an Gruppenleiter

### Backend Social Media (Python, `services/social-media/`)
- Python 3.11 + FastAPI + Uvicorn
- Whisper large-v3 (Transkription, lokal CPU)
- GPT-4o-mini (Highlights, Captions)
- Replicate Flux.1-dev (Zitat-Bilder)
- moviepy + ffmpeg (Clips)
- Deployment: Fly.io (TODO)

### Datenbank (Supabase)
- Auth: E-Mail + Passwort
- Tabellen: user_settings, sermons, generated_materials, NEU: social_media_jobs, social_media_assets, social_waitlist
- Storage Buckets: sermons, materials, NEU: social-exports
- Edge Functions: Deno-basiert, generate-materials existiert, generate-social folgt

---

## Branding

- Primärfarbe: Sage/Olive-Grün #6b806c (Abstufungen #8a9f8b, #a3b5a4)
- Dark Background: #0f1720
- Light Text: #e5e7eb
- Dark Mode Standard, Light Mode unterstützt
- Ton: Warm, professionell, nicht kitschig-christlich
- Keine Emojis in UI-Texten

---

## Wichtige Regeln

### Architektur
- Supabase-Schema-Änderungen IMMER über `supabase/migrations/*.sql`, niemals direkt
- Edge Functions mit corsHeaders auf https://kirchenki.com beschränken
- RLS-Policies Pflicht für jede neue Tabelle mit User-Daten
- Binary-Uploads via multipart/form-data, nicht JSON

### Code
- TypeScript strict mode
- shadcn/ui bevorzugen, keine neuen UI-Libraries ohne Rücksprache
- Icons ausschließlich aus lucide-react
- Keine localStorage/sessionStorage für sensible Daten

### Sprache
- User-facing Text: Deutsch (Du-Form default)
- Code, Variablen, Commits: Englisch
- Kommentare: Deutsch für Business-Logik, Englisch für Technik

### Social-Media-Feature: besondere Vorsicht
- KEINE automatischen Postings – User lädt ZIP, postet selbst
- Review-Screen vor Download (User kann ablehnen/neu generieren)
- Kein Jesus-Gesichts-Prompt bei Flux-Bildern
- Zuhörer-Datenschutz: keine erkennbaren Gesichter in Clips

### Business-Logik
- Jeder Flow prüft User-Quota vor Start (sermon_credits in user_settings)
- Gemeinde-Plan: 4 Predigten/Monat inklusive, danach €9 pro zusätzlicher

---

## Entscheidungen, die Claude Code NICHT allein treffen darf

- Neue Dependencies (außer shadcn/ui)
- Änderungen am Preismodell
- Änderungen an E-Mail-Templates an User
- Hard-Deletes von Daten (Soft-Delete default)
- Production-Deployment
- Schema-Änderungen, die existierende Spalten verändern

---

## Branch-Strategie & Environments

| Branch      | Environment | Auto-Deploy zu              |
|-------------|-------------|-----------------------------|
| `main`      | Production  | kirchenki.com               |
| `develop`   | Development | dev.kirchenki.com           |
| `feature/*` | Preview     | Netlify Deploy Preview URL  |

**Flow:** `feature/xyz` → PR → `develop` (CI muss gruen sein) → PR → `main` (CI muss gruen sein).

**Branch-Protection:**
- `main`: PR erforderlich, keine Force-Pushes
- `develop`: Direkte Pushes erlaubt, keine Force-Pushes
- Approvals sind NICHT erforderlich (Shared-GitHub-Account)
- CI-Enforcement wird aktiviert sobald der erste CI-Run durch ist

**Commits:** Conventional Commits — `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`

---

## Arbeitsweise mit Claude Code

- Schrittweise arbeiten, nach jeder Aufgabe stoppen
- Keine Eigeninitiative über den Auftrag hinaus
- Bei Unklarheiten nachfragen, nicht raten
- Bei Änderungen an Produktions-relevanten Files (Schema, Edge Functions, Production-Config) vorher Rückfrage
