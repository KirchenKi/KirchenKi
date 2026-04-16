import React, { useEffect, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const hasRecoveryType = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return params.get('type') === 'recovery';
};

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isRecovery, setIsRecovery] = useState(hasRecoveryType());
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }
      setHasSession(!!data.session);
      setReady(true);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
      setHasSession(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwörter stimmen nicht überein',
        description: 'Bitte prüfe deine Eingaben.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: 'Passwort ändern fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Passwort aktualisiert',
        description: 'Du kannst dich jetzt mit dem neuen Passwort anmelden.',
      });
      setSuccess(true);
    }

    setLoading(false);
  };

  const handleBackToHome = () => {
    window.location.assign('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg border border-border/60 bg-card/80 backdrop-blur shadow-elevated">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Passwort zurücksetzen</CardTitle>
            <CardDescription className="text-base">
              Lege ein neues Passwort fest, damit du dich wieder anmelden kannst.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {!ready ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm">Wird vorbereitet...</span>
              </div>
            ) : success ? (
              <div className="space-y-5 text-center py-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
                  <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  Dein Passwort wurde aktualisiert. Du kannst dich jetzt wieder anmelden.
                </p>
                <Button onClick={handleBackToHome} className="w-full rounded-xl">
                  Zur Startseite
                </Button>
              </div>
            ) : !isRecovery ? (
              <div className="space-y-5 text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Bitte öffne den Link aus deiner Reset-E-Mail, um ein neues Passwort zu setzen.
                </p>
                <Button onClick={handleBackToHome} variant="secondary" className="w-full rounded-xl">
                  Zur Startseite
                </Button>
              </div>
            ) : !hasSession ? (
              <div className="space-y-5 text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Der Link ist ungültig oder abgelaufen. Fordere bitte einen neuen Reset-Link an.
                </p>
                <Button onClick={handleBackToHome} variant="secondary" className="w-full rounded-xl">
                  Zur Startseite
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Neues Passwort</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Mindestens 6 Zeichen"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-background"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Passwort wiederholen"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-background"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gespeichert...
                    </>
                  ) : (
                    'Passwort speichern'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
