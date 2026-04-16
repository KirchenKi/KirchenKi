import React from 'react';
import { BookOpen, Users, MessageCircle, HandHeart } from 'lucide-react';
import { FadeInSection } from './FadeInSection';

const useCases = [
  {
    title: 'Predigten vorbereiten',
    description: 'Struktur, Gliederung und Kernideen als Unterstützung.',
    icon: BookOpen,
  },
  {
    title: 'Kleingruppen-Material erstellen',
    description: 'Fragen und Impulse, die auf die Predigt zugeschnitten sind.',
    icon: Users,
  },
  {
    title: 'Gemeindekommunikation',
    description: 'Kurzfassungen und Highlights für Info-Kanäle.',
    icon: MessageCircle,
  },
  {
    title: 'Gebete & Andachten',
    description: 'Ideen und Worte zur geistlichen Vertiefung.',
    icon: HandHeart,
  },
];

export const UseCasesSection: React.FC = () => {
  return (
    <section id="features" className="w-full px-4 md:px-8 py-16 md:py-20 bg-card/70">
      <div className="max-w-6xl mx-auto space-y-12">
        <FadeInSection className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Anwendungsfälle</p>
          <h2 className="mt-4 text-3xl md:text-4xl text-foreground">Wofür Kirchen KI hilft</h2>
          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
            Fokus auf Predigt und Kleingruppe – mit unterstützenden Entwürfen und Impulsen.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((item, index) => (
            <FadeInSection key={item.title} delay={index * 0.08} className="h-full">
              <div className="h-full rounded-2xl border border-border bg-background/80 backdrop-blur p-6 shadow-soft">
                <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg text-foreground font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};
