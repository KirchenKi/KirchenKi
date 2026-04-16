import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Mail, Save, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  type TargetAudience =
    | 'kindergruppe'
    | 'jungschar_royal_ranger'
    | 'teenie_kreis'
    | 'konfi'
    | 'jugend'
    | 'junge_erwachsene'
    | 'hauskreis'
    | 'bibelstunde'
    | 'maennerkreis'
    | 'frauenkreis'
    | 'ehepaarkreis_familien'
    | 'seniorenkreis';
  const TARGET_AUDIENCES: { id: TargetAudience; label: string }[] = [
    { id: 'kindergruppe', label: 'Kindergruppe' },
    { id: 'jungschar_royal_ranger', label: 'Jungschar / Royal Ranger' },
    { id: 'teenie_kreis', label: 'Teenie-Kreis' },
    { id: 'konfi', label: 'Konfi' },
    { id: 'jugend', label: 'Jugend' },
    { id: 'junge_erwachsene', label: 'Junge Erwachsene' },
    { id: 'hauskreis', label: 'Hauskreis' },
    { id: 'bibelstunde', label: 'Bibelstunde' },
    { id: 'maennerkreis', label: 'Männerkreis' },
    { id: 'frauenkreis', label: 'Frauenkreis' },
    { id: 'ehepaarkreis_familien', label: 'Ehepaarkreis / Familien' },
    { id: 'seniorenkreis', label: 'Seniorenkreis' },
  ];

  type AudienceEmailConfig = Record<TargetAudience, { emails: string[]; emailInput: string }>;
  type AudienceAutomationConfig = Record<TargetAudience, { enabled: boolean; day: string; time: string }>;

  const initialAudienceEmails: AudienceEmailConfig = {
    kindergruppe: { emails: [], emailInput: '' },
    jungschar_royal_ranger: { emails: [], emailInput: '' },
    teenie_kreis: { emails: [], emailInput: '' },
    konfi: { emails: [], emailInput: '' },
    jugend: { emails: [], emailInput: '' },
    junge_erwachsene: { emails: [], emailInput: '' },
    hauskreis: { emails: [], emailInput: '' },
    bibelstunde: { emails: [], emailInput: '' },
    maennerkreis: { emails: [], emailInput: '' },
    frauenkreis: { emails: [], emailInput: '' },
    ehepaarkreis_familien: { emails: [], emailInput: '' },
    seniorenkreis: { emails: [], emailInput: '' },
  };

  const initialAutomations: AudienceAutomationConfig = {
    kindergruppe: { enabled: false, day: 'sunday', time: '19:00' },
    jungschar_royal_ranger: { enabled: false, day: 'sunday', time: '19:00' },
    teenie_kreis: { enabled: false, day: 'sunday', time: '19:00' },
    konfi: { enabled: false, day: 'sunday', time: '19:00' },
    jugend: { enabled: false, day: 'sunday', time: '19:00' },
    junge_erwachsene: { enabled: false, day: 'sunday', time: '19:00' },
    hauskreis: { enabled: false, day: 'sunday', time: '19:00' },
    bibelstunde: { enabled: false, day: 'sunday', time: '19:00' },
    maennerkreis: { enabled: false, day: 'sunday', time: '19:00' },
    frauenkreis: { enabled: false, day: 'sunday', time: '19:00' },
    ehepaarkreis_familien: { enabled: false, day: 'sunday', time: '19:00' },
    seniorenkreis: { enabled: false, day: 'sunday', time: '19:00' },
  };

  const [audienceEmails, setAudienceEmails] = useState<AudienceEmailConfig>(initialAudienceEmails);
  const [audienceAutomations, setAudienceAutomations] = useState<AudienceAutomationConfig>(initialAutomations);
  const [settings, setSettings] = useState({
    defaultEmail: '',
    preferredAudience: [] as string[],
    userName: '',
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Fehler beim Laden der Einstellungen:', error);
    } else if (data) {
      setSettings({
        defaultEmail: data.default_email || '',
        preferredAudience: data.preferred_audience || [],
        userName: user.user_metadata?.display_name || data.user_name || '',
      });

      if (data.group_emails) {
        setAudienceEmails(prev => {
          const next = { ...prev };
          TARGET_AUDIENCES.forEach((audience) => {
            const emails = Array.isArray(data.group_emails[audience.id]) ? data.group_emails[audience.id] : [];
            next[audience.id] = { ...next[audience.id], emails };
          });
          return next;
        });
      }

      if (data.group_automations) {
        setAudienceAutomations(prev => {
          const next = { ...prev };
          TARGET_AUDIENCES.forEach((audience) => {
            const entry = data.group_automations[audience.id];
            if (!entry) return;
            next[audience.id] = {
              enabled: Boolean(entry.enabled),
              day: entry.day || 'sunday',
              time: entry.time || '19:00',
            };
          });
          return next;
        });
      }
    }

    const avatarPath = user.user_metadata?.avatar_storage_path;
    if (avatarPath) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(publicUrl);
      setAvatarPreview(publicUrl);
    }
  };

  const cropAndResizeImage = (file: File, size: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));

        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Blob conversion failed'))),
          'image/png',
          0.9
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Ungültiges Format', description: 'Bitte wähle ein Bild aus.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Datei zu groß', description: 'Das Bild darf maximal 5 MB groß sein.', variant: 'destructive' });
      return;
    }

    setUploadingAvatar(true);

    try {
      const croppedBlob = await cropAndResizeImage(file, 256);
      const storagePath = `${user.id}/avatar.png`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, croppedBlob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(storagePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl, avatar_storage_path: storagePath },
      });

      if (authError) throw authError;

      setAvatarUrl(publicUrl);
      setAvatarPreview(publicUrl);
      toast({ title: 'Profilbild aktualisiert', description: 'Dein Profilbild wurde erfolgreich gespeichert.' });
      window.location.reload();
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast({ title: 'Fehler', description: 'Profilbild konnte nicht gespeichert werden.', variant: 'destructive' });
      setAvatarPreview(null);
    }

    setUploadingAvatar(false);
  };

  const removeAvatar = async () => {
    if (!user) return;
    setUploadingAvatar(true);

    try {
      await supabase.storage.from('avatars').remove([`${user.id}/avatar.png`]);

      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null, avatar_storage_path: null },
      });

      if (error) throw error;

      setAvatarUrl(null);
      setAvatarPreview(null);
      toast({ title: 'Profilbild entfernt', description: 'Dein Profilbild wurde entfernt.' });
      window.location.reload();
    } catch {
      toast({ title: 'Fehler', description: 'Profilbild konnte nicht entfernt werden.', variant: 'destructive' });
    }

    setUploadingAvatar(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);

    const [{ error: dbError }, { error: authError }] = await Promise.all([
      supabase.from('user_settings').upsert({
        user_id: user.id,
        user_name: settings.userName,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }),
      supabase.auth.updateUser({
        data: { display_name: settings.userName },
      }),
    ]);

    if (dbError || authError) {
      toast({ title: 'Fehler', description: 'Profil konnte nicht gespeichert werden.', variant: 'destructive' });
    } else {
      toast({ title: 'Profil gespeichert', description: 'Dein Benutzername wurde aktualisiert.' });
      window.location.reload();
    }

    setSavingProfile(false);
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);

    const groupEmailsPayload = TARGET_AUDIENCES.reduce<Record<string, string[]>>((acc, audience) => {
      acc[audience.id] = audienceEmails[audience.id].emails;
      return acc;
    }, {});

    const groupAutomationsPayload = TARGET_AUDIENCES.reduce<Record<string, { enabled: boolean; day: string; time: string }>>(
      (acc, audience) => {
        acc[audience.id] = audienceAutomations[audience.id];
        return acc;
      },
      {}
    );

    const [{ error: dbError }, { error: authError }] = await Promise.all([
      supabase.from('user_settings').upsert({
        user_id: user.id,
        default_email: settings.defaultEmail,
        preferred_audience: settings.preferredAudience,
        user_name: settings.userName,
        group_emails: groupEmailsPayload,
        group_automations: groupAutomationsPayload,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }),
      supabase.auth.updateUser({
        data: { display_name: settings.userName },
      }),
    ]);

    if (dbError || authError) {
      toast({
        title: 'Fehler',
        description: 'Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erfolgreich gespeichert',
        description: 'Deine Einstellungen wurden aktualisiert.',
      });
      window.location.reload();
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Einstellungen</h1>
          <p className="text-muted-foreground">
            Verwalte deine persönlichen Einstellungen und Präferenzen
          </p>
        </div>

        <div className="space-y-6">
          {/* Profil-Informationen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil
              </CardTitle>
              <CardDescription>Deine Account-Informationen und Profilbild</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profilbild */}
              <div className="space-y-4">
                <Label>Profilbild</Label>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || avatarUrl || undefined} alt={settings.userName || user?.email || ''} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                      {settings.userName ? settings.userName.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingAvatar ? 'Wird hochgeladen...' : 'Bild hochladen'}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeAvatar}
                        disabled={uploadingAvatar}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Entfernen
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max. 5 MB, JPG, PNG oder GIF
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Benutzername */}
              <div className="space-y-2">
                <Label htmlFor="userName">Benutzername</Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Dein Name"
                  value={settings.userName}
                  onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Dieser Name wird in deinem Profil angezeigt
                </p>
              </div>

              <Separator />

              {/* E-Mail */}
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input value={user?.email || ''} disabled />
                </div>
                <p className="text-sm text-muted-foreground">
                  E-Mail-Adresse kann nicht geändert werden
                </p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={savingProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  {savingProfile ? 'Wird gespeichert...' : 'Profil speichern'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Einstellungen */}
          <Card>
            <CardHeader>
              <CardTitle>Standard-Einstellungen</CardTitle>
              <CardDescription>
                Diese Einstellungen werden als Standard für neue Uploads verwendet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Empfänger & Automationen pro Gruppe</Label>
                {TARGET_AUDIENCES.map((audience) => (
                  <div key={audience.id} className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{audience.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {audienceEmails[audience.id].emails.length} Empfänger
                      </span>
                    </div>

                    {audienceEmails[audience.id].emails.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {audienceEmails[audience.id].emails.map((email, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={() => {
                                setAudienceEmails(prev => ({
                                  ...prev,
                                  [audience.id]: {
                                    ...prev[audience.id],
                                    emails: prev[audience.id].emails.filter((_, i) => i !== index),
                                  },
                                }));
                              }}
                              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="E-Mail-Adresse hinzufügen..."
                        value={audienceEmails[audience.id].emailInput}
                        onChange={(e) =>
                          setAudienceEmails(prev => ({
                            ...prev,
                            [audience.id]: {
                              ...prev[audience.id],
                              emailInput: e.target.value,
                            },
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const email = audienceEmails[audience.id].emailInput.trim();
                            if (!email || !EMAIL_REGEX.test(email)) return;
                            setAudienceEmails(prev => ({
                              ...prev,
                              [audience.id]: {
                                emails: [...prev[audience.id].emails, email],
                                emailInput: '',
                              },
                            }));
                          }
                        }}
                        className="flex-1 bg-background"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const email = audienceEmails[audience.id].emailInput.trim();
                          if (!email || !EMAIL_REGEX.test(email)) return;
                          setAudienceEmails(prev => ({
                            ...prev,
                            [audience.id]: {
                              emails: [...prev[audience.id].emails, email],
                              emailInput: '',
                            },
                          }));
                        }}
                      >
                        Hinzufügen
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-4">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={audienceAutomations[audience.id].enabled}
                          onChange={(e) =>
                            setAudienceAutomations(prev => ({
                              ...prev,
                              [audience.id]: {
                                ...prev[audience.id],
                                enabled: e.target.checked,
                              },
                            }))
                          }
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        Automatisch senden
                      </label>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Tag</span>
                        <select
                          value={audienceAutomations[audience.id].day}
                          onChange={(e) =>
                            setAudienceAutomations(prev => ({
                              ...prev,
                              [audience.id]: {
                                ...prev[audience.id],
                                day: e.target.value,
                              },
                            }))
                          }
                          className="h-9 rounded-md border border-border bg-background px-2 text-foreground"
                          disabled={!audienceAutomations[audience.id].enabled}
                        >
                          <option value="monday">Montag</option>
                          <option value="tuesday">Dienstag</option>
                          <option value="wednesday">Mittwoch</option>
                          <option value="thursday">Donnerstag</option>
                          <option value="friday">Freitag</option>
                          <option value="saturday">Samstag</option>
                          <option value="sunday">Sonntag</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Uhrzeit</span>
                        <Input
                          type="time"
                          value={audienceAutomations[audience.id].time}
                          onChange={(e) =>
                            setAudienceAutomations(prev => ({
                              ...prev,
                              [audience.id]: {
                                ...prev[audience.id],
                                time: e.target.value,
                              },
                            }))
                          }
                          className="h-9 w-[120px] bg-background"
                          disabled={!audienceAutomations[audience.id].enabled}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="defaultEmail">Standard E-Mail-Adresse</Label>
                <Input
                  id="defaultEmail"
                  type="email"
                  placeholder="deine@email.de"
                  value={settings.defaultEmail}
                  onChange={(e) => setSettings({ ...settings, defaultEmail: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Diese E-Mail wird standardmäßig für Transkripte verwendet
                </p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Wird gespeichert...' : 'Einstellungen speichern'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Abmelden */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;

