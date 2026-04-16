import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { MiniDemoSection } from '@/components/landing/MiniDemoSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { StoryEthicsSection } from '@/components/landing/StoryEthicsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <MiniDemoSection />
        <UseCasesSection />
        <StoryEthicsSection />
        <TestimonialsSection />
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
