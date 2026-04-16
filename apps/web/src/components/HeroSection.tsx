import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, FileText } from 'lucide-react';
const benefits = [{
  icon: Clock,
  title: 'Zeit sparen',
  description: 'Stunden an Arbeit werden zu Minuten'
}, {
  icon: Users,
  title: 'Alle erreichen',
  description: 'Material für jede Altersgruppe'
}, {
  icon: FileText,
  title: 'Einfach nutzen',
  description: 'Datei hochladen – fertig'
}];
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

  return <section className="w-full px-4 md:px-8 py-12 md:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Headline */}
        <motion.h1 initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-foreground mb-6 text-5xl pt-0">Predigt hochladen.<br />
          <span className="text-accent text-5xl">Material für alle erhalten.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p className="text-muted-foreground text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto mb-6" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.15
      }}>Aus einer Predigt wird automatisch Material für alle relevanten Gruppen.</motion.p>

        <motion.div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto mb-12" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }}>
          {groupLabels.map(label => <span key={label} className="px-3 py-1 rounded-full bg-secondary/70 text-xs text-muted-foreground border border-border">
              {label}
            </span>)}
        </motion.div>

        {/* Benefits */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.3
      }}>
          {benefits.map((benefit, index) => <motion.div key={benefit.title} className="flex flex-col items-center p-6 rounded-2xl bg-card/70 backdrop-blur border border-border/60 shadow-soft" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.4 + index * 0.1
        }}>
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-base">
                {benefit.description}
              </p>
            </motion.div>)}
        </motion.div>
      </div>
    </section>;
};