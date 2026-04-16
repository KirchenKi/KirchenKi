# KirchenKI v2 – Setup & Roadmap

> TL;DR: Kein Rewrite. Wir erweitern das bestehende Repo um das Social-Media-Modul und modernisieren die Landing Page in zwei parallelen Tracks. Ziel: In 2–3 Wochen ein zweites Feature live, ohne das erste zu gefährden.

## Ausgangslage

- Frontend (React/Vite/TS/Tailwind/shadcn): produktiv, solide → `apps/web/`
- Supabase (Auth + Tabellen + Edge Function): produktiv, 2 Kirchen nutzen es
- n8n Workflow (Predigt → Materialien): produktiv, stabil
- Social-Media-Prototyp (Python FastAPI): PoC → `services/social-media/`
- Landing Page: funktional, aber überladen

## Ziel-Architektur

Monorepo mit:
- `apps/web/` – bestehendes React-Frontend
- `services/social-media/` – Python FastAPI
- `supabase/` – Edge Functions + Migrations
- `docs/` – Dokumentation
- `.claude/` – Claude Code Config

## Roadmap – Parallele Tracks

### Track A: Website-Relaunch (Woche 1)
- Redundanz-Audit der 7 Landing-Sections (Ziel: 5 klar differenzierte Sections)
- 21st.dev gezielt für Hero + Bento-Grid, nicht flächendeckend
- Social-Media-Feature als "Early Access" mit Waitlist-Table

### Track B: Social-Media-Modul (Woche 1–3)
- Python-Service auf Fly.io deployen
- Edge Function `generate-social` parallel zu `generate-materials`
- Dashboard-Integration als zweiter Tab
- Pilot mit den 2 Testkirchen, kein Public-Rollout

## Offene Entscheidungen

1. Auth beim Social-Media-Feature: gleicher Account oder separat?
2. Pricing: Social Media im €49-Plan oder Add-On?
3. Haftung bei theologisch daneben liegenden Flux-Bildern → Review-Screen Pflicht
4. Hosting-Kosten: Whisper lokal vs. OpenAI API

## Red Flags

- Track B länger als 3 Wochen → MVP-Scope hinterfragen
- Keine Waitlist-Signups → Feature löst falsches Problem
- Konversion nach Website-Relaunch schlechter → zurückrollen
