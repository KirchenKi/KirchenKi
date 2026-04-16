import React from 'react';
import { Quote } from 'lucide-react';
import { FadeInSection } from './FadeInSection';

const testimonials = [
  {
    quote: 'Kirchen KI hilft uns, schneller bei der Predigt zu den Kleingruppenfragen zu kommen.',
    name: 'Miriam K.',
    role: 'Pastorin, Freie evangelische Gemeinde',
  },
  {
    quote: 'Die Impulse sind eine echte Unterstützung für unsere Leiter.',
    name: 'Jonas W.',
    role: 'Kleingruppenleiter, Landeskirche',
  },
  {
    quote: 'Wir gewinnen Zeit und bleiben näher an der Predigt.',
    name: 'Sarah L.',
    role: 'Gemeindekommunikation',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="w-full px-4 md:px-8 py-16 md:py-20 bg-card/70">
      <div className="max-w-6xl mx-auto space-y-12">
        <FadeInSection className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Stimmen</p>
          <h2 className="mt-4 text-3xl md:text-4xl text-foreground">Gemeinden vertrauen Kirchen KI</h2>
          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
            Erfahrungsberichte aus Kirchen und Werken, die Kirchen KI testen.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <FadeInSection key={item.name} delay={index * 0.1} className="h-full">
              <div className="h-full rounded-2xl border border-border bg-background/80 backdrop-blur p-6 shadow-soft">
                <Quote className="h-6 w-6 text-accent mb-4" />
                <p className="text-muted-foreground mb-6">“{item.quote}”</p>
                <p className="text-foreground font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};
