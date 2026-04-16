import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeInSection } from './FadeInSection';

const plans = [
  {
    name: 'Starter',
    price: 'Kostenlos testen',
    description: 'Ideal für erste Predigten und einen kleinen Kreis.',
    features: ['Predigt hochladen', 'Kleingruppenfragen als Output', 'E-Mail-Zustellung'],
    cta: 'Jetzt starten',
  },
  {
    name: 'Gemeinde',
    price: 'Gemeindelizenz',
    description: 'Für mehrere Gruppen, Teams und wachsende Gemeinden.',
    features: ['Mehrere Kleingruppen', 'Gemeinsame Verwaltung', 'Onboarding-Unterstützung'],
    cta: 'Kontakt aufnehmen',
    highlight: true,
  },
];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="w-full px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-6xl mx-auto space-y-12">
        <FadeInSection className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Preise</p>
          <h2 className="mt-4 text-3xl md:text-4xl text-foreground">Ein Einstieg, der zu euch passt</h2>
          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
            Transparent und flexibel – für Einzelpersonen und ganze Gemeinden.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <FadeInSection key={plan.name} delay={index * 0.1} className="h-full">
              <div
                className={`h-full rounded-3xl border ${
                  plan.highlight ? 'border-accent shadow-elevated bg-background' : 'border-border bg-card/70'
                } backdrop-blur p-6 flex flex-col`}
              >
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{plan.name}</p>
                  <p className="text-3xl text-foreground font-semibold">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
                  {plan.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  className={`mt-6 rounded-full ${plan.highlight ? '' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                >
                  <a href="/tool.html">{plan.cta}</a>
                </Button>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};
