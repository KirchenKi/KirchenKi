# Supabase Setup für KirchenKI

## 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein kostenloses Konto (falls noch nicht vorhanden)
3. Klicke auf "New Project"
4. Fülle aus:
   - **Name**: KirchenKI (oder ein anderer Name)
   - **Database Password**: Wähle ein sicheres Passwort (speichere es!)
   - **Region**: Wähle die nächstgelegene Region (z.B. Frankfurt)
5. Klicke auf "Create new project"
6. Warte 2-3 Minuten, bis das Projekt erstellt ist

## 2. API Keys holen

1. Gehe zu deinem Projekt Dashboard
2. Klicke auf **Settings** (Zahnrad-Symbol) → **API**
3. Du findest dort:
   - **Project URL** → Das ist deine `VITE_SUPABASE_URL`
   - **anon public** Key → Das ist deine `VITE_SUPABASE_ANON_KEY`

## 3. Environment Variables setzen

### Lokal (für Entwicklung):

Die `.env` Datei wurde bereits erstellt mit deinen Keys:

```env
VITE_SUPABASE_URL=https://zuibxmswerhlipzpbjod.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_urbIEodqIO3S14xosvy1Kw_RJDI2Jed
```

**Wichtig**: Die `.env` Datei ist bereits in `.gitignore` und wird nicht zu GitHub gepusht!

### Netlify (für Produktion):

1. Gehe zu deinem Netlify Dashboard
2. Wähle dein Projekt
3. Gehe zu **Site settings** → **Environment variables**
4. Füge hinzu:
   - `VITE_SUPABASE_URL` = `https://zuibxmswerhlipzpbjod.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_urbIEodqIO3S14xosvy1Kw_RJDI2Jed`
5. Klicke auf "Save"

## 4. Datenbank-Tabelle erstellen

1. Gehe zu deinem Supabase Dashboard
2. Klicke auf **SQL Editor** (linke Sidebar)
3. Führe diesen SQL-Befehl aus:

```sql
-- Tabelle für User-Einstellungen
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  default_email TEXT,
  preferred_audience TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security aktivieren
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: User können nur ihre eigenen Einstellungen sehen/bearbeiten
-- WICHTIG: Diese Policies werden nur erstellt, wenn sie noch nicht existieren
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_settings' 
    AND policyname = 'Users can view own settings'
  ) THEN
    CREATE POLICY "Users can view own settings"
      ON user_settings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_settings' 
    AND policyname = 'Users can insert own settings'
  ) THEN
    CREATE POLICY "Users can insert own settings"
      ON user_settings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_settings' 
    AND policyname = 'Users can update own settings'
  ) THEN
    CREATE POLICY "Users can update own settings"
      ON user_settings FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
```

4. Klicke auf **Run** (oder drücke F5)
5. Du solltest eine Erfolgsmeldung sehen: "Success. No rows returned"

**WICHTIG**: Falls du die Tabelle bereits erstellt hast, führe diesen zusätzlichen SQL-Befehl aus, um die neuen Felder hinzuzufügen:

```sql
-- Erweitere die Tabelle um avatar_url und user_name
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT;
```

## 4b. Predigten & Materialien Tabellen erstellen

```sql
-- Tabelle für Predigten
CREATE TABLE IF NOT EXISTS sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  original_file_name TEXT,
  file_path TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Materialien pro Gruppe
CREATE TABLE IF NOT EXISTS generated_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
  group_name TEXT,
  file_name TEXT,
  file_path TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_materials ENABLE ROW LEVEL SECURITY;

-- Policies für sermons
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sermons' 
    AND policyname = 'Users can view own sermons'
  ) THEN
    CREATE POLICY "Users can view own sermons"
      ON sermons FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sermons' 
    AND policyname = 'Users can insert own sermons'
  ) THEN
    CREATE POLICY "Users can insert own sermons"
      ON sermons FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policies für generated_materials
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'generated_materials' 
    AND policyname = 'Users can view own materials'
  ) THEN
    CREATE POLICY "Users can view own materials"
      ON generated_materials FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'generated_materials' 
    AND policyname = 'Users can insert own materials'
  ) THEN
    CREATE POLICY "Users can insert own materials"
      ON generated_materials FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
```

## 4c. Storage Buckets anlegen

- **sermons** (privat) – Originaldateien
- **materials** (privat) – Generierte Materialien

## 4d. Edge Function Umgebungsvariablen

Setze in Supabase die folgenden Secrets für die Edge Function:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
N8N_WEBHOOK_URL=https://kirchenki.app.n8n.cloud/webhook/kirchenki-request
N8N_WEBHOOK_SECRET=optional
```

## 5. Email Authentication aktivieren

1. Gehe zu **Authentication** → **Providers** (linke Sidebar)
2. Stelle sicher, dass **Email** aktiviert ist (Standard: aktiviert)
3. Optional: Konfiguriere Email Templates unter **Email Templates**
   - Du kannst die E-Mail-Vorlagen für "Confirm signup", "Reset password" etc. anpassen

## 6. Testen

### Lokal testen:

1. Starte den Dev-Server:
   ```bash
   npm run dev
   ```

2. Gehe zu `http://localhost:8080/tool.html`

3. Versuche dich zu registrieren:
   - Klicke auf "Anmelden" im Header
   - Wechsle zum Tab "Registrieren"
   - Gib eine E-Mail und ein Passwort ein (mindestens 6 Zeichen)
   - Klicke auf "Registrieren"

4. Prüfe deine E-Mail:
   - Du solltest eine Bestätigungs-E-Mail von Supabase erhalten
   - Klicke auf den Link in der E-Mail, um dein Konto zu bestätigen

5. Melde dich an:
   - Nach der Bestätigung kannst du dich mit E-Mail und Passwort anmelden

6. Prüfe in Supabase:
   - Gehe zu **Authentication** → **Users** im Supabase Dashboard
   - Du solltest deinen neuen User sehen

### Auf Netlify testen:

1. Stelle sicher, dass die Environment Variables in Netlify gesetzt sind (siehe Schritt 3)
2. Pushe deine Änderungen zu GitHub:
   ```bash
   git add .
   git commit -m "Supabase Integration hinzugefügt"
   git push
   ```
3. Netlify baut automatisch neu
4. Teste die Login-Funktion auf deiner Live-Seite

## 7. Features die jetzt funktionieren

✅ **User Registrierung** - User können sich mit E-Mail registrieren
✅ **User Login** - User können sich anmelden
✅ **Geschützte Tool-Seite** - Nur angemeldete User können `/tool.html` aufrufen
✅ **Settings-Seite** - User können ihre Einstellungen unter `/settings.html` verwalten
✅ **User-spezifische Daten** - Jeder User hat seine eigenen Einstellungen in der Datenbank

## 8. Troubleshooting

### Problem: "Supabase URL oder Anon Key fehlt"
- **Lösung**: Stelle sicher, dass die `.env` Datei im Root-Verzeichnis existiert und die richtigen Werte enthält
- Starte den Dev-Server neu: `npm run dev`

### Problem: "Failed to fetch" oder CORS-Fehler
- **Lösung**: Prüfe, ob die Supabase URL korrekt ist
- Stelle sicher, dass dein Supabase-Projekt aktiv ist

### Problem: "User already registered"
- **Lösung**: Der User existiert bereits. Versuche dich anzumelden statt zu registrieren

### Problem: E-Mail kommt nicht an
- **Lösung**: 
  - Prüfe den Spam-Ordner
  - In der Entwicklungsumgebung kannst du die E-Mail-Bestätigung in Supabase deaktivieren:
    - Gehe zu **Authentication** → **Providers** → **Email**
    - Deaktiviere "Confirm email" (nur für Entwicklung!)

### Problem: "relation user_settings does not exist"
- **Lösung**: Die Datenbank-Tabelle wurde noch nicht erstellt. Führe den SQL-Befehl aus Schritt 4 aus.

## 9. Nächste Schritte

Nachdem alles funktioniert, kannst du:

- **Weitere Einstellungen hinzufügen**: Erweitere die `user_settings` Tabelle in Supabase
- **Upload-Historie speichern**: Erstelle eine neue Tabelle für gespeicherte Uploads
- **User-Profile erweitern**: Füge weitere Felder zum User-Profil hinzu

## Fertig! 🎉

Deine Supabase-Integration ist jetzt vollständig eingerichtet. User können sich registrieren, anmelden und ihre Einstellungen speichern.

