import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const { signIn, resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erfolgreich angemeldet',
        description: 'Willkommen zurück!',
      });
      onOpenChange(false);
      setEmail('');
      setPassword('');
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPasswordForEmail(email);

    if (error) {
      toast({
        title: 'Passwort-Zurücksetzen fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'E-Mail gesendet',
        description: 'Wir haben dir einen Link zum Zurücksetzen geschickt.',
      });
      setActiveTab('login');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-border/60 bg-card/95 backdrop-blur-lg shadow-elevated rounded-2xl">
        <DialogHeader className="text-center space-y-3 pb-1">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Anmelden bei KirchenKI</DialogTitle>
          <DialogDescription className="text-sm">
            Melde dich an, um auf das Tool zuzugreifen und deine Einstellungen zu verwalten.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="login" className="rounded-lg">Anmelden</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg">Registrieren</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-background"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="px-0 text-muted-foreground hover:text-primary"
                  onClick={() => setActiveTab('forgot')}
                >
                  Passwort vergessen?
                </Button>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird angemeldet...
                  </>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="forgot">
            <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-background"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  'Reset-Link senden'
                )}
              </Button>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => setActiveTab('login')}
                >
                  Zurück zur Anmeldung
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <div className="space-y-5 text-center py-4">
              <p className="text-sm text-muted-foreground">
                Bitte kontaktiere uns unter <a href="mailto:info@kirchenki.com" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">info@kirchenki.com</a>.
              </p>
              <Button asChild className="w-full h-12 rounded-xl text-base font-semibold">
                <a href="mailto:info@kirchenki.com">E-Mail schreiben</a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

