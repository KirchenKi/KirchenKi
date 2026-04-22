import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Smartphone } from "lucide-react";
import { Header } from "@/components/Header";
import { FooterMinimal } from "@/components/FooterMinimal";
import { UploadSection } from "@/components/UploadSection";
import { SocialMediaSection } from "@/components/SocialMediaSection";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Index() {
  return (
    <ProtectedRoute>
      <div className="relative min-h-screen flex flex-col bg-background">
        {/* Subtle aurora tint at the top */}
        <div className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none overflow-hidden opacity-40">
          <div className="absolute inset-0 bg-gradient-to-b from-[#6b806c]/15 via-[#a5b4fc]/10 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8a9f8b]/10 via-transparent to-transparent" />
        </div>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:font-semibold"
        >
          Zum Hauptinhalt springen
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          <div className="max-w-4xl mx-auto pt-8 md:pt-12 px-4">
            <Tabs defaultValue="materials" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="materials" className="gap-2">
                  <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                  Kleingruppen-Materialien
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-2">
                  <Smartphone className="w-4 h-4" strokeWidth={1.5} />
                  Social Media
                  <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#6b806c] text-white uppercase tracking-wider">Beta</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="materials">
                <UploadSection />
              </TabsContent>

              <TabsContent value="social">
                <SocialMediaSection />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <FooterMinimal />
      </div>
    </ProtectedRoute>
  );
}
