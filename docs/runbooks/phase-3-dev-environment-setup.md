# Runbook: Dev-Environment aufsetzen

**Für:** Co-Founder (Infrastruktur-Zugriff)
**Zeit:** 45-60 Minuten
**Ziel:** `dev.kirchenki.com` live bringen mit eigener Supabase + eigenem n8n,
damit wir gefahrlos an der V2 arbeiten können ohne kirchenki.com zu
gefährden.

---

## Kontext (2 Minuten lesen, bevor du startest)

**Was wir schon haben (ist fertig):**
- Monorepo auf GitHub: `github.com/KirchenKi/KirchenKi` (privat)
- `main` = was aktuell auf kirchenki.com läuft (identischer Code)
- `develop` = Janns V2-Arbeit (neue Landing, Tool-Redesign, Social-Media-Section)
- CI läuft (Lint + Build + Typecheck auf jedem PR)
- README + ADR-001 drin, Branch-Protection aktiv

**Was du hier baust:**
Ein Parallel-Universum. `kirchenki.com` bleibt unverändert, daneben entsteht
`dev.kirchenki.com` als Test-Spielwiese mit eigener Datenbank, eigenem n8n,
eigenen Env-Vars. Wenn wir etwas Neues bauen, testen wir es dort erst.
Erst wenn's stabil ist, mergen wir `develop` → `main` und es geht live.

**Was du NICHT machen sollst:**
- Nichts an der Prod-Supabase ändern
- Nicht den existierenden n8n-Workflow umbauen
- Nicht die Netlify-Prod-Site umstecken (das ist Phase 2, später zusammen)

---

## Voraussetzungen

Zugriff auf:
- **Supabase Dashboard** (Prod-Projekt — zum Reinschauen, nicht ändern)
- **Netlify Dashboard** (wo die Prod-Site läuft — wir erstellen nur eine
  **neue** Site, die Prod-Site bleibt unangetastet)
- **n8n Cloud** (`kirchenki.app.n8n.cloud`)
- **DNS-Panel** für `kirchenki.com` (wo auch immer ihr die Domain registriert
  habt — Netlify DNS, Ionos, Strato, Cloudflare, whatever)

Optional: Supabase CLI installiert lokal (`brew install supabase/tap/supabase`
oder Windows-Pendant). Geht aber auch komplett über das Dashboard.

---

## Task 1 — Neues Supabase-Projekt "kirchenki-dev"

1. Auf [app.supabase.com](https://app.supabase.com) einloggen
2. "New project" klicken (oder im Dashboard oben links "Organizations" →
   gleiche Org wählen wie Prod)
3. Einstellungen:
   - **Name**: `kirchenki-dev`
   - **Database Password**: sicheres Passwort generieren und **sofort in
     1Password / Signal-Notiz speichern** (bekommst du nie wieder zu sehen)
   - **Region**: **genau dieselbe wie Prod** (vermutlich Frankfurt /
     eu-central-1) — wichtig für DSGVO und Latenz
   - **Pricing Plan**: Free Tier reicht
4. "Create new project" → 2 Minuten warten bis ready

5. **Notier dir 3 Werte** (später gebraucht):
   - Project Settings → General → **Reference ID** (z.B. `abcdef123456`)
   - Project Settings → API → **Project URL** (z.B. `https://abcdef123456.supabase.co`)
   - Project Settings → API → **anon public key** (langer Token, fängt mit `eyJ...` an)

   → Jann bekommt die 3 Werte (oder pack sie später selber in Netlify rein, siehe Task 5).

**✅ Check:** Du siehst `kirchenki-dev` in der Projekt-Liste, Status grün.

---

## Task 2 — Schema vom Prod nach Dev kopieren

Das ist der riskanteste Schritt. Wir wollen dieselben Tabellen + Columns in
Dev wie in Prod, aber ohne die echten User-Daten.

### Variante A (empfohlen): Supabase-CLI

```bash
# Einmalig: CLI installieren (falls noch nicht da)
brew install supabase/tap/supabase   # macOS
# oder: scoop install supabase (Windows)

# Lokal ins Repo
git clone https://github.com/KirchenKi/KirchenKi.git kirchenki
cd kirchenki

# Login
supabase login

# Prüfen ob unsere migrations/ den Prod-Stand abbilden
supabase link --project-ref <prod-project-ref>
supabase db diff --linked

# Falls Diff leer → migrations/ passt, weiter mit "Auf Dev anwenden"
# Falls Diff was zeigt → Baseline aus Prod ziehen:
supabase db pull
git checkout -b chore/supabase-baseline
git add supabase/migrations/
git commit -m "chore(supabase): add baseline schema from prod"
git push -u origin chore/supabase-baseline
# PR gegen develop öffnen + mergen

# Auf Dev anwenden:
supabase link --project-ref <dev-project-ref>
supabase db push
```

### Variante B (wenn CLI zu fummelig): Dashboard-Copy

1. Prod-Projekt → Database → Schemas → `public` → "Export schema" (oben rechts)
2. SQL-Datei speichern
3. Dev-Projekt → SQL Editor → "New query" → SQL-Datei-Inhalt reinpasten → Run
4. Nebenbei: Dieselbe SQL lokal in `supabase/migrations/<YYYYMMDD>_baseline.sql`
   ablegen, committen (damit wir den Stand versioniert haben)

**✅ Check:** In Dev-Supabase → Database → Tables: alle Tabellen die in Prod
existieren (u.a. `user_settings`, `sermons`, `generated_materials`) sind
auch in Dev da. Daten sind leer, das ist gewollt.

---

## Task 3 — Test-User + Seed-Data in Dev

1. Dev-Supabase → Authentication → Users → **Add user**
   - Email: `test@kirchenki-dev.com` (oder eine Wegwerf-Mail)
   - Passwort: nach Wahl, merken
   - Auto-confirm: **ja**
2. Nach Erstellen: User-ID kopieren (die UUID `xxxxx-xxxx-...`)
3. Dev-Supabase → SQL Editor → neue Query:

   ```sql
   -- Ersetze UUID durch die kopierte User-ID
   INSERT INTO user_settings (user_id, sermon_credits, created_at)
   VALUES ('<DEINE-USER-UUID>', 4, NOW())
   ON CONFLICT (user_id) DO NOTHING;
   ```

   → Run.

**✅ Check:** Dev-Supabase → Table Editor → `user_settings` hat eine Zeile
mit dem Test-User.

---

## Task 4 — Netlify Dev-Site anlegen

**Achtung**: Wir legen eine **neue, zweite** Netlify-Site an. Die
Prod-Site `kirchenki.com` bleibt komplett unverändert.

1. [app.netlify.com](https://app.netlify.com) einloggen
2. "Add new site" → "Import an existing project" → "Deploy with GitHub"
3. Falls GitHub-Autorisierung gefragt: für den `KirchenKi` Org-Account
   autorisieren
4. Repository wählen: **`KirchenKi/KirchenKi`**
5. Deploy-Settings:
   - **Branch to deploy**: **`develop`** (NICHT main!)
   - **Base directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` (relativ zum Base Directory)
6. "Deploy site" klicken
7. **Erster Build wird fehlschlagen** — das ist erwartet, weil Env-Vars
   noch fehlen. Gleich gefixt.
8. Nach dem Fail-Build: Site settings → "Change site name" → `kirchenki-dev`
   → Save. Ergibt die interne URL `kirchenki-dev.netlify.app`.

**✅ Check:** Du hast eine Netlify-Site namens `kirchenki-dev`, sie baut
aus dem `develop`-Branch, Build ist rot (weil Env fehlen).

---

## Task 5 — Env-Vars in Dev-Netlify setzen

1. Dev-Site → **Site settings** → **Environment variables** → "Add a variable"

2. Zwei Variablen anlegen (**nicht** die Prod-Werte hier nehmen, sondern die
   aus Task 1):

   | Key                      | Value                                        |
   |--------------------------|----------------------------------------------|
   | `VITE_SUPABASE_URL`      | `https://<dev-project-ref>.supabase.co`      |
   | `VITE_SUPABASE_ANON_KEY` | `<dev-anon-key>` (aus Task 1, der eyJ...-Wert)|

   **Scope für beide**: "All scopes" (Production + Deploy Previews)

3. Dev-Site → **Deploys** → "Trigger deploy" → "Deploy site"
4. Warten bis Build grün → auf `kirchenki-dev.netlify.app` klicken

**✅ Check:** `kirchenki-dev.netlify.app` zeigt die **V2-Landing** (Aurora
Hero, "Zwei Wege"-Sektion, Video-Einbettung). Login mit `test@kirchenki-dev.com`
funktioniert.

Falls das klappt: du hast den entscheidenden Punkt erreicht. Der Rest ist nur
noch Kosmetik (schöne Domain) + n8n.

---

## Task 6 — Custom Domain dev.kirchenki.com

1. Netlify Dev-Site → **Domain management** → "Add a custom domain"
2. Eintragen: `dev.kirchenki.com` → "Verify" → "Yes, add domain"
3. Netlify zeigt dir jetzt eine Anleitung mit CNAME-Details. Merk dir den
   Ziel-Host (meist `kirchenki-dev.netlify.app`).

4. **DNS-Panel vom Domain-Provider** öffnen (wo kirchenki.com registriert ist)
5. Neuen DNS-Eintrag hinzufügen:

   | Feld            | Wert                             |
   |-----------------|----------------------------------|
   | **Type**        | CNAME                            |
   | **Host / Name** | `dev` (nur die Subdomain)        |
   | **Value / Target** | `kirchenki-dev.netlify.app`   |
   | **TTL**         | 3600 (oder Provider-Default)     |

6. Speichern.
7. Zurück in Netlify → "Verify DNS configuration". Kann 5-60 Min dauern.
   Netlify generiert automatisch ein Let's Encrypt SSL-Zertifikat.

**✅ Check:** `https://dev.kirchenki.com` öffnet (mit Schloss-Icon im
Browser), zeigt dieselbe V2-Seite wie `kirchenki-dev.netlify.app`.

---

## Task 7 — n8n Dev-Workflow anlegen

1. [kirchenki.app.n8n.cloud](https://kirchenki.app.n8n.cloud) einloggen
2. Bestehenden produktiven Workflow öffnen
3. Menü (3 Punkte oben rechts) → **Duplicate**
4. Neuen Namen: **`KirchenKI DEV`**
5. Im Dev-Workflow **alle Nodes durchgehen, die Credentials nutzen**:
   - **Supabase-Nodes**: neue Credential anlegen mit den **Dev-Supabase-Werten**
     (Project URL + Service-Role-Key aus Dev-Supabase → Project Settings → API)
   - **Gmail-Nodes**: Empfänger-Adresse auf eine **Test-Mail** umstellen,
     damit keine Fake-Materials an echte Gruppen gesendet werden
6. Workflow → "Active"-Toggle rechts oben anschalten
7. Trigger-Node öffnen, **Webhook-URL kopieren** (sollte sich von der Prod-URL unterscheiden)
8. Diese URL braucht Jann, um die Dev-Supabase Edge Functions später zu
   konfigurieren — schick sie ihm.

**✅ Check:** `KirchenKI DEV` Workflow ist aktiv, hat eine eigene Webhook-URL,
zeigt auf Dev-Supabase.

---

## Nach Abschluss — was du Jann zurückmelden sollst

Einfach diese Info per Message/Mail schicken:

```
✅ Dev-Environment steht.

- Dev-Supabase Project Ref: <abcdef...>
- Dev-Supabase URL: https://<ref>.supabase.co
- Dev-Supabase anon key: eyJ...
- Dev-Supabase service_role key: eyJ... (nur zur Info, wird für Edge
  Functions gebraucht)
- Test-User: test@kirchenki-dev.com / <passwort>
- Netlify Dev-URL: https://dev.kirchenki.com ✅ grün
- n8n Dev-Webhook: https://kirchenki.app.n8n.cloud/webhook/<ID>
```

---

## Troubleshooting

| Symptom | Ursache | Fix |
|---|---|---|
| Netlify-Build schlägt fehl mit "command not found: npm ci" | Base Directory falsch | Site Settings → Build → Base: `apps/web` |
| `dev.kirchenki.com` zeigt "Site not found" | DNS noch nicht propagiert | 30 Min warten, dann `nslookup dev.kirchenki.com` prüfen |
| Login auf Dev geht, aber Supabase-Fehler "Invalid API key" | Prod-Key statt Dev-Key in Netlify | In Netlify Env-Vars den anon key aus Dev-Supabase einsetzen |
| Dev-Supabase Tabellen fehlen | Schema-Push nicht durchgelaufen | Task 2 nochmal, bei Variante B SQL-Output auf Fehler prüfen |
| n8n Dev-Workflow triggert Prod-Supabase | Supabase-Credential nicht umgestellt | Jeden Supabase-Node einzeln prüfen, Credential auf "Dev" setzen |

---

## Was noch offen bleibt (nicht deine Aufgabe in dieser Runde)

- **Edge Functions auf Dev-Supabase deployen**: Wenn welche existieren (z.B.
  `generate-materials`), müssen sie separat nach Dev gepusht werden — Jann
  macht das in einem Folge-Schritt, braucht deine Dev-Credentials.
- **Phase 2 — Prod-Netlify auf neues Repo umstecken**: Das machen wir
  **zusammen** in einem ruhigen Zeitfenster, nicht hier. Bei dem Schritt ist
  die Pilot-Kirchen-Website kurz potenziell betroffen.
- **Phase 5 — Render Team-Zugriff**: Fünf-Minuten-Ding, kann jederzeit später.

Bei Unklarheiten: frag Jann, bevor du was klickst. Lieber einmal zuviel
gefragt als Prod-Supabase aus Versehen bearbeitet.
