import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection: React.FC = () => {
  const groupLabels = [
    'Kindergruppe',
    'Jungschar / Royal Ranger',
    'Teenie-Kreis',
    'Konfi',
    'Jugend',
    'Junge Erwachsene',
    'Hauskreis',
    'Bibelstunde',
    'Männerkreis',
    'Frauenkreis',
    'Ehepaarkreis / Familien',
    'Seniorenkreis',
  ];
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showVideoHint, setShowVideoHint] = useState(true);
  const keepVideoPlaying = (video: HTMLVideoElement) => {
    if (video.paused) {
      video.play().catch(() => undefined);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowVideoHint(false), 3500);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <section id="hero" className="w-full px-4 md:px-8 pt-10 md:pt-16 pb-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/70 backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">
              Kirchen KI – dein geistlicher AI-Assistent
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            Dein KI‑Assistent für Predigten, Kleingruppen & Gemeindearbeit.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground"
          >
            Predigt hochladen → kompakte Zusammenfassung, Kleingruppenfragen und
            Reflexionsimpulse in Minuten. Weniger Zeitdruck, mehr geistlicher Fokus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap gap-2 justify-center lg:justify-start"
          >
            {groupLabels.map((label) => (
              <span
                key={label}
                className="px-3 py-1 rounded-full bg-secondary/70 text-xs text-muted-foreground border border-border"
              >
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button asChild size="lg" className="rounded-full px-8 shadow-elevated hover:scale-105 transition-transform">
              <a href="/tool.html">Jetzt kostenlos testen</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-accent text-foreground">
              <a href="#demo">Demo ansehen</a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-primary/20 blur-2xl" aria-hidden="true" />

          <div className="relative rounded-3xl border border-border bg-background/80 backdrop-blur-lg shadow-elevated p-4 md:p-6">
            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              className="relative aspect-video w-full rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/20 overflow-hidden"
              aria-label="Video in groß öffnen"
            >
              {showVideoHint && (
                <motion.div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="absolute h-28 w-28 rounded-full border border-primary/50"
                    animate={{ scale: [0.6, 1.2], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: 2, ease: "easeOut" }}
                  />
                  <div className="rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft">
                    Zum Vergrößern klicken
                  </div>
                </motion.div>
              )}
              <video
                className="h-full w-full object-cover dark:hidden"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                onCanPlay={(e) => keepVideoPlaying(e.currentTarget)}
                onPause={(e) => keepVideoPlaying(e.currentTarget)}
              >
                <source src="/KirchenKI_Tutorial_Lightmode_Big.mp4" type="video/mp4" />
              </video>
              <video
                className="hidden h-full w-full object-cover dark:block"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                onCanPlay={(e) => keepVideoPlaying(e.currentTarget)}
                onPause={(e) => keepVideoPlaying(e.currentTarget)}
              >
                <source src="/KirchenKI_Tutorial_DarkMode.mp4" type="video/mp4" />
              </video>
            </button>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-foreground font-bold mb-1 text-[0.7rem] sm:text-xs leading-tight break-words">Zusammenfassung</p>
                <p className="text-[0.7rem] sm:text-xs text-muted-foreground">Kernpunkte deiner Predigt in Kürze.</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-foreground font-bold mb-1 text-[0.7rem] sm:text-xs leading-tight break-words">Kleingruppen</p>
                <p className="text-[0.7rem] sm:text-xs text-muted-foreground">Fragen & Impulse als Beispiel.</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-foreground font-bold mb-1 text-[0.7rem] sm:text-xs leading-tight break-words">Reflexion</p>
                <p className="text-[0.7rem] sm:text-xs text-muted-foreground">Praxisidee für die Woche.</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-foreground font-bold mb-1 text-[0.7rem] sm:text-xs leading-tight break-words">Output</p>
                <p className="text-[0.7rem] sm:text-xs text-muted-foreground">Individuell pro Gruppe erstellt.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-[92vw] max-w-4xl rounded-2xl border border-border bg-card/90 p-3 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              className="w-full rounded-xl object-contain dark:hidden"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              onCanPlay={(e) => keepVideoPlaying(e.currentTarget)}
              onPause={(e) => keepVideoPlaying(e.currentTarget)}
            >
              <source src="/KirchenKI_Tutorial_Lightmode_Big.mp4" type="video/mp4" />
            </video>
            <video
              className="hidden w-full rounded-xl object-contain dark:block"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              onCanPlay={(e) => keepVideoPlaying(e.currentTarget)}
              onPause={(e) => keepVideoPlaying(e.currentTarget)}
            >
              <source src="/KirchenKI_Tutorial_DarkMode.mp4" type="video/mp4" />
            </video>
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
