import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoginDialog } from './LoginDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import churchIcon from '@/assets/church-icon.png';
import { Settings, LogOut, User, Sun, Moon } from 'lucide-react';

const matchPage = (name: string) =>
  typeof window !== 'undefined' &&
  (window.location.pathname.includes(`${name}.html`) || window.location.pathname.endsWith(`/${name}`) || window.location.pathname.endsWith(`/${name}/`));

const isToolPage = matchPage('tool');
const isSettingsPage = matchPage('settings');
const isDashboardPage = matchPage('dashboard');
const isLandingPage = !isToolPage && !isSettingsPage && !isDashboardPage;
const showBrandImage = isLandingPage || isToolPage || isDashboardPage;

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('kirchenki-theme');
    if (stored) {
      setIsDarkMode(stored === 'dark');
    } else {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('kirchenki-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data: { user: freshUser } } = await supabase.auth.getUser();
    const meta = freshUser?.user_metadata || user.user_metadata;

    const displayName = meta?.display_name || '';

    if (!displayName) {
      const { data } = await supabase
        .from('user_settings')
        .select('user_name')
        .eq('user_id', user.id)
        .maybeSingle();
      setUserName(data?.user_name || '');
    } else {
      setUserName(displayName);
    }

    if (meta?.avatar_url) {
      setAvatarUrl(meta.avatar_url);
    } else if (meta?.avatar_storage_path) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(meta.avatar_storage_path);
      setAvatarUrl(`${urlData.publicUrl}?t=${Date.now()}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    if (isToolPage || isSettingsPage || isDashboardPage) {
      window.location.href = '/';
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="w-full py-4 px-4 md:px-8 sticky top-0 z-40 backdrop-blur bg-background/70 border-b border-border/60">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.a
            href="/"
            className="flex items-center gap-3 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-2 rounded-lg px-2 py-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            aria-label="Kirchen-KI Startseite"
          >
            {showBrandImage ? (
              <img
                src="/kirchenki-logo.png"
                alt="Kirchen-KI Logo"
                className="h-[4.4rem] md:h-[5.5rem] w-auto"
              />
            ) : (
              <>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary flex items-center justify-center p-1.5">
                  <img src={churchIcon} alt="Kirchen-KI Logo" className="w-full h-full object-contain invert" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-foreground">
                  Kirchen-KI
                </span>
              </>
            )}
          </motion.a>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            {!isToolPage && (
              <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <a href="#features" className="hover:text-foreground transition-colors">
                  Funktionen
                </a>
                <a href="#demo" className="hover:text-foreground transition-colors">
                  Demo
                </a>
                <a href="#story" className="hover:text-foreground transition-colors">
                  Warum Kirchen KI?
                </a>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Preise
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsDarkMode(prev => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur hover:scale-105 transition-transform"
              aria-label="Dark Mode umschalten"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
            </button>

            {user && (isToolPage || isDashboardPage || isSettingsPage) && (
              <div className="hidden sm:flex items-center gap-2">
                {!isToolPage && (
                  <a
                    href="/tool.html"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-colors"
                  >
                    Eingabetool
                  </a>
                )}
                {!isDashboardPage && (
                  <a
                    href="/dashboard.html"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-colors"
                  >
                    Dashboard
                  </a>
                )}
                {!isSettingsPage && (
                  <a
                    href="/settings.html"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-xl font-medium text-sm hover:bg-secondary/80 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Einstellungen
                  </a>
                )}
              </div>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-full">
                    <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                      <AvatarImage src={avatarUrl || undefined} alt={userName || user.email || ''} />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {userName ? userName.substring(0, 2).toUpperCase() : getInitials(user.email || '')}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName || 'Benutzer'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(isToolPage || isDashboardPage || isSettingsPage) && (
                    <>
                      {!isToolPage && (
                        <DropdownMenuItem asChild>
                          <a href="/tool.html" className="cursor-pointer">
                            Eingabetool
                          </a>
                        </DropdownMenuItem>
                      )}
                      {!isDashboardPage && (
                        <DropdownMenuItem asChild>
                          <a href="/dashboard.html" className="cursor-pointer">
                            Dashboard
                          </a>
                        </DropdownMenuItem>
                      )}
                      {!isSettingsPage && (
                        <DropdownMenuItem asChild>
                          <a href="/settings.html" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Einstellungen
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {isToolPage ? (
                  <Button
                    onClick={() => setShowLogin(true)}
                    className="hidden sm:inline-flex"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Anmelden
                  </Button>
                ) : (
                  <a
                    href="/tool.html"
                    className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-base hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2"
                  >
                    Zum Tool
                  </a>
                )}
              </>
            )}
          </motion.div>
        </nav>
      </header>
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
};

