import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { UploadSection } from '@/components/UploadSection';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Skip to main content link for accessibility */}
        <a
          href="#upload"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:font-semibold"
        >
          Zum Hauptinhalt springen
        </a>

        <Header />
        
        <main className="flex-1">
          <UploadSection />
          <HeroSection />
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
