import React from 'react';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full px-4 md:px-8 py-14 mt-12 border-t border-border bg-background/70">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          <div className="space-y-4">
            <a
              href="/"
              className="flex items-center gap-3 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-2 rounded-lg px-2 py-1"
              aria-label="Kirchen-KI Startseite"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                Kirchen-KI
              </span>
            </a>
            <p className="text-muted-foreground text-base max-w-sm">
              Von Christen für Gemeinden. KI, die euch hilft, Zeit zu gewinnen und geistliche Inhalte zu vertiefen.
            </p>
          </div>

          <div className="flex flex-col gap-6 text-sm text-muted-foreground">
            <div className="flex flex-col gap-2">
              <p className="text-foreground font-semibold">Produkt</p>
              <a href="#features" className="hover:text-foreground transition-colors">Funktionen</a>
              <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Preise</a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-foreground font-semibold">Gemeinden</p>
              <a href="#story" className="hover:text-foreground transition-colors">Warum Kirchen KI?</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Stimmen</a>
              <a href="mailto:info@kirchenki.com" className="hover:text-foreground transition-colors">Kontakt</a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-foreground font-semibold">Rechtliches</p>
              <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
              <a href="#" className="hover:text-foreground transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border pt-8">
          <p className="text-muted-foreground text-sm">
            Newsletter mit kurzen Updates zu neuen Funktionen und Ressourcen.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input
              type="email"
              placeholder="E-Mail für den Newsletter"
              className="min-w-[240px] bg-background"
            />
            <Button type="button" className="rounded-full">
              Anmelden
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
};

