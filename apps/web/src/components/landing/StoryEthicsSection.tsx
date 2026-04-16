import React from 'react';
import { ShieldCheck, HandHeart, Scale } from 'lucide-react';
import { FadeInSection } from './FadeInSection';

const ethicsPoints = [
  {
    title: 'Datenschutz & Vertrauen',
    description: 'DSGVO-konform, keine Weitergabe von Inhalten an Dritte.',
    icon: ShieldCheck,
  },
  {
    title: 'KI als Werkzeug',
    description: 'Kirchen KI unterstützt – sie ersetzt keine Seelsorge.',
    icon: HandHeart,
  },
  {
    title: 'Theologische Verantwortung',
    description: 'Die letzte Entscheidung liegt immer bei Menschen.',
    icon: Scale,
  },
];

const onboardingSteps = [
  'Predigt oder Manuskript hochladen.',
  'Kleingruppen auswählen und Empfänger festlegen.',
  'Material prüfen und an die Gemeinde weitergeben.',
];

export const StoryEthicsSection: React.FC = () => {
  return (
    <section id="story" className="w-full px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <FadeInSection>
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Warum Kirchen KI?</p>
            <h2 className="text-3xl md:text-4xl text-foreground">Mehr Zeit für Menschen, weniger Druck.</h2>
            <p className="text-muted-foreground">
              Hauptamtliche und Ehrenamtliche sind oft überlastet. Kirchen KI hilft beim Strukturieren
              und Vorbereiten – damit ihr euch auf Seelsorge, Leitung und Beziehung konzentrieren könnt.
            </p>

            <div className="rounded-3xl border border-border bg-card/70 backdrop-blur p-6 shadow-soft">
              <p className="text-foreground font-semibold mb-4">So startest du mit Kirchen KI in deiner Gemeinde</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {onboardingSteps.map(step => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="rounded-3xl border border-border bg-background/80 backdrop-blur p-6 md:p-8 shadow-soft space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Theologisch verantwortungsvoll
            </p>
            <div className="space-y-4">
              {ethicsPoints.map(point => (
                <div key={point.title} className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center">
                    <point.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{point.title}</p>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};
