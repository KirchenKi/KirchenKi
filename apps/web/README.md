# KirchenKI - Multi-Page Struktur

Dieses Projekt verwendet eine **Multi-Page-Struktur** mit separaten HTML-Dateien:

- **`index.html`** → Landing Page (öffentliche Startseite)
- **`tool.html`** → Tool-Seite (Upload-Funktion)

## Struktur

### Landing Page
- **Datei**: `index.html`
- **Entry Point**: `src/main-landing.tsx`
- **Komponente**: `src/pages/LandingPage.tsx`
- **URL**: `/` oder `/index.html`

### Tool-Seite
- **Datei**: `tool.html`
- **Entry Point**: `src/main-tool.tsx`
- **Komponente**: `src/pages/Index.tsx`
- **URL**: `/tool.html` oder `/tool` (wird zu `/tool.html` weitergeleitet)

## Entwicklung

### Installation

```bash
npm install
```

### Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung läuft dann auf `http://localhost:8080`

- Landing Page: `http://localhost:8080/`
- Tool-Seite: `http://localhost:8080/tool.html`

### Build für Produktion

```bash
npm run build
```

Das erstellt zwei separate HTML-Dateien im `dist/` Ordner:
- `dist/index.html` (Landing Page)
- `dist/tool.html` (Tool-Seite)

## Deployment auf Netlify

Das Projekt ist für Netlify konfiguriert:

1. **Netlify-Konfiguration**: `netlify.toml` und `public/_redirects` sind vorhanden
2. **Build-Befehl**: `npm run build`
3. **Publish-Verzeichnis**: `dist`

### Schritte für Netlify:

1. Erstelle ein neues Projekt auf Netlify
2. Verbinde es mit deinem Git-Repository
3. Netlify erkennt automatisch die Konfiguration
4. Deploy!

### Redirects

- `/tool` → `/tool.html` (automatische Weiterleitung)
- Alle anderen Routen → `/index.html`

## Projektstruktur

```
├── index.html                 # Landing Page HTML
├── tool.html                  # Tool-Seite HTML
├── src/
│   ├── main-landing.tsx       # Entry Point für Landing Page
│   ├── main-tool.tsx          # Entry Point für Tool-Seite
│   ├── pages/
│   │   ├── LandingPage.tsx    # Landing Page Komponente
│   │   └── Index.tsx           # Tool-Seite Komponente
│   ├── components/
│   │   ├── Header.tsx          # Header mit Navigation
│   │   ├── Footer.tsx          # Footer
│   │   ├── HeroSection.tsx     # Hero-Section für Tool
│   │   ├── UploadSection.tsx   # Upload-Bereich
│   │   ├── UploadZone.tsx      # Upload-Komponente
│   │   └── ui/                 # UI-Komponenten (shadcn/ui)
│   └── ...
├── public/                     # Statische Dateien
├── netlify.toml               # Netlify-Konfiguration
└── package.json
```

## Unterschied zur SPA-Struktur

Diese Multi-Page-Struktur hat **separate HTML-Dateien** statt einer Single Page Application:

- ✅ Jede Seite hat ihre eigene HTML-Datei
- ✅ Klare Trennung zwischen Landing Page und Tool
- ✅ Einfacher zu verstehen für statisches Hosting
- ✅ Kein React Router nötig (normale Links)

## Features

- ✅ Multi-Page-Struktur mit separaten HTML-Dateien
- ✅ Responsive Design
- ✅ Accessibility (WCAG-konform)
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui Komponenten
- ✅ Netlify-ready

## Technologien

- React 18
- TypeScript
- Vite (Multi-Page Build)
- Tailwind CSS
- Framer Motion
- shadcn/ui
