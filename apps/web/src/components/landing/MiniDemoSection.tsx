import React from 'react';
import { FadeInSection } from './FadeInSection';

export const MiniDemoSection: React.FC = () => {
  return (
    <section id="demo" className="w-full px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-6xl mx-auto space-y-12">
        <FadeInSection className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Mini-Demo</p>
          <h2 className="mt-4 text-3xl md:text-4xl text-foreground">So funktioniert Kirchen KI</h2>
          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
            Füge ein Predigt-Snippet ein und sieh eine Beispiel-Ausgabe. Die echte Verarbeitung passiert im Tool.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FadeInSection className="rounded-3xl border border-border bg-background/80 backdrop-blur p-6 md:p-8 shadow-soft">
            <p className="text-sm font-medium text-muted-foreground mb-4">Ablauf im Tool</p>
            <div className="flow-timeline">
              <div className="flow-step-row">
                <span className="flow-dot-lg" aria-hidden="true"></span>
                <div>
                  <p className="text-sm text-foreground font-semibold flow-step-title">Predigt reingeben</p>
                  <p className="text-xs text-muted-foreground flow-step-sub">Audio oder Dokument hochladen</p>
                </div>
              </div>
              <div className="flow-connector"></div>
              <div className="flow-step-row">
                <span className="flow-dot-lg" aria-hidden="true"></span>
                <div>
                  <p className="text-sm text-foreground font-semibold flow-step-title">Wird transkribiert</p>
                  <p className="text-xs text-muted-foreground flow-step-sub">KI extrahiert Kernaussagen</p>
                </div>
              </div>
              <div className="flow-connector"></div>
              <div className="flow-step-row">
                <span className="flow-dot-lg" aria-hidden="true"></span>
                <div>
                  <p className="text-sm text-foreground font-semibold flow-step-title">Gruppenspezifischer Output</p>
                  <p className="text-xs text-muted-foreground flow-step-sub">Fragen & Impulse für eure Gruppen</p>
                </div>
              </div>
              <div className="flow-connector"></div>
              <div className="flow-step-row">
                <span className="flow-dot-lg" aria-hidden="true"></span>
                <div>
                  <p className="text-sm text-foreground font-semibold flow-step-title">E‑Mail mit Dokument</p>
                  <p className="text-xs text-muted-foreground flow-step-sub">Material wird automatisch verschickt</p>
                </div>
              </div>
            </div>

            <div className="flow-pulse-bar" aria-hidden="true"></div>

            <div className="flow-tags">
              <span className="flow-tag">Zusammenfassung</span>
              <span className="flow-tag">Kleingruppenfragen</span>
              <span className="flow-tag">Praxisimpuls</span>
              <span className="flow-tag">E-Mail‑Versand</span>
            </div>
          </FadeInSection>

          <FadeInSection className="rounded-3xl border border-border bg-card/70 backdrop-blur p-6 md:p-8 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Beispiel-Ausgabe</p>
              <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                Mock
              </span>
            </div>

            <div className="mt-6 space-y-5 text-sm text-muted-foreground">
              <div>
                <p className="text-foreground font-semibold mb-2">Zusammenfassung</p>
                <p>Gottes Gnade begegnet uns vor jeder Leistung und schenkt neue Freiheit.</p>
              </div>
              <div>
                <p className="text-foreground font-semibold mb-2">Kleingruppenfragen</p>
                <ul className="space-y-1">
                  <li>• Wo erlebst du Gnade im Alltag?</li>
                  <li>• Wie kann deine Gruppe heute ermutigen?</li>
                </ul>
              </div>
              <div>
                <p className="text-foreground font-semibold mb-2">Praxisimpuls</p>
                <p>Schreibt eine kurze Dankesnachricht an jemanden, der euch begleitet hat.</p>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Vorschau-Beispiel – im Tool wird dein Output individuell erstellt.
            </p>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};
