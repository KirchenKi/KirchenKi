-- Erweitere die user_settings Tabelle um avatar_url und user_name
-- Führe diesen SQL-Befehl im Supabase SQL Editor aus
-- Dieser Befehl fügt nur die Spalten hinzu, wenn sie noch nicht existieren

-- Füge neue Spalten hinzu (falls sie noch nicht existieren)
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Die Tabelle sollte jetzt folgende Struktur haben:
-- id, user_id, default_email, preferred_audience, avatar_url, user_name, created_at, updated_at

-- Prüfe ob die Spalten erfolgreich hinzugefügt wurden:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;
