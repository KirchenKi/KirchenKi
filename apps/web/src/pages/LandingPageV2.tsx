import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import { BookOpen, Smartphone, Upload, Sparkles, Send } from "lucide-react";
import { LandingNavV2 } from "@/components/LandingNavV2";

const FadeInWhenVisible = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut", delay }
      }
    }}
  >
    {children}
  </motion.div>
);

export default function LandingPageV2() {
  return (
    <>
      <LandingNavV2 />
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="relative flex flex-col gap-6 items-center justify-center px-4 text-center max-w-4xl"
        >
          <div className="text-xs font-semibold tracking-widest uppercase text-black/60">
            KirchenKI v2
          </div>
          <h1 className="text-4xl md:text-7xl font-bold text-black leading-tight">
            Von der Predigt<br />zur ganzen Gemeinde.
          </h1>
          <p className="text-lg md:text-2xl text-black/70 max-w-2xl">
            Automatisierte Kleingruppen-Materialien. Social-Media-Clips. In unter 10 Minuten.
          </p>
          <button className="mt-4 px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition">
            Early Access sichern
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-black/60">
            <span className="flex h-2 w-2 rounded-full bg-[#6b806c] animate-pulse"></span>
            Bereits im Einsatz bei 2 Pilot-Gemeinden
          </div>
        </motion.div>
      </AuroraBackground>

      <section id="features" className="bg-zinc-50 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <div className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
                So funktioniert KirchenKI
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4">
                Eine Predigt.<br />Zwei Wege zur Gemeinde.
              </h2>
              <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                Du lädst einmal hoch. KirchenKI erstellt beides automatisch.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Track 1: Kleingruppen */}
            <FadeInWhenVisible>
              <div className="bg-white rounded-2xl p-8 border border-zinc-200 hover:border-zinc-300 transition">
                <div className="w-12 h-12 rounded-xl bg-[#6b806c]/10 flex items-center justify-center mb-6">
                  <BookOpen className="w-6 h-6 text-[#6b806c]" strokeWidth={1.5} />
                </div>
                <div className="text-xs font-semibold tracking-widest uppercase text-[#6b806c] mb-3">
                  Kleingruppen-Materialien
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                  Für 12 Altersgruppen automatisch aufbereitet
                </h3>
                <p className="text-zinc-600 mb-6">
                  Von Kindergruppe bis Seniorenkreis. Inhalte werden für jede Gruppe
                  altersgerecht aufbereitet und direkt per E-Mail an die Gruppenleiter verteilt.
                </p>
                <div className="text-sm font-medium text-[#6b806c]">
                  Live verfügbar →
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Track 2: Social Media */}
            <FadeInWhenVisible delay={0.15}>
              <div className="bg-white rounded-2xl p-8 border border-zinc-200 hover:border-zinc-300 transition relative">
                <div className="absolute top-6 right-6 text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 text-white">
                  Early Access
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#6b806c]/10 flex items-center justify-center mb-6">
                  <Smartphone className="w-6 h-6 text-[#6b806c]" strokeWidth={1.5} />
                </div>
                <div className="text-xs font-semibold tracking-widest uppercase text-[#6b806c] mb-3">
                  Social Media
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                  Clips, Zitat-Bilder & Captions in 10 Minuten
                </h3>
                <p className="text-zinc-600 mb-6">
                  Die stärksten Momente der Predigt werden automatisch als Social-Media-Content
                  aufbereitet. Du reviewst, lädst herunter, postest selbst.
                </p>
                <div className="text-sm font-medium text-[#6b806c]">
                  Demnächst verfügbar →
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      <section id="video" className="bg-zinc-50 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-12">
              <div className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
                Siehst du in 2 Minuten
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4">
                KirchenKI live in Aktion.
              </h2>
              <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                Wie aus einer Predigt im Handumdrehen zwölf Gruppenmaterialien werden.
              </p>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.2}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 bg-black">
              <video
                src="/KirchenKI_Tutorial_Lightmode_Big.mp4"
                controls
                preload="metadata"
                className="w-full h-auto block"
              >
                Dein Browser unterstützt leider keine eingebetteten Videos.
              </video>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      <section id="how" className="bg-white py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <div className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
                So einfach geht's
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4">
                Drei Schritte bis zum fertigen Material.
              </h2>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-zinc-200 -z-0" />

            <FadeInWhenVisible>
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center mb-6 relative">
                  <Upload className="w-8 h-8 text-[#6b806c]" strokeWidth={1.5} />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#6b806c] text-white text-sm font-bold flex items-center justify-center">1</div>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">Predigt hochladen</h3>
                <p className="text-zinc-600 text-sm leading-relaxed max-w-xs">
                  Audio, Video oder Text. Egal ob MP3 aus der Sonntagsaufzeichnung oder PDF-Manuskript.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.15}>
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center mb-6 relative">
                  <Sparkles className="w-8 h-8 text-[#6b806c]" strokeWidth={1.5} />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#6b806c] text-white text-sm font-bold flex items-center justify-center">2</div>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">KirchenKI arbeitet</h3>
                <p className="text-zinc-600 text-sm leading-relaxed max-w-xs">
                  Altersgerechte Materialien für 12 Gruppen. Plus Social-Media-Clips mit Zitaten und Captions.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center mb-6 relative">
                  <Send className="w-8 h-8 text-[#6b806c]" strokeWidth={1.5} />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#6b806c] text-white text-sm font-bold flex items-center justify-center">3</div>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">Fertig für die Gemeinde</h3>
                <p className="text-zinc-600 text-sm leading-relaxed max-w-xs">
                  Materialien werden automatisch an Gruppenleiter verteilt. Social-Media-Content lädst du als ZIP herunter.
                </p>
              </div>
            </FadeInWhenVisible>
          </div>

          <FadeInWhenVisible delay={0.5}>
            <div className="text-center mt-16">
              <p className="text-zinc-500 text-sm">
                Durchschnittliche Bearbeitungszeit: unter 10 Minuten.
              </p>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      <section className="bg-zinc-50 py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-10">
              <div className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
                Stimmen aus Pilot-Gemeinden
              </div>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.2}>
            <blockquote className="relative bg-white rounded-2xl border border-zinc-200 p-10 md:p-12 shadow-sm">
              <div className="absolute -top-4 left-10 px-3 py-1 rounded-full bg-[#6b806c] text-white text-xs font-semibold uppercase tracking-widest">
                Pilot-Feedback
              </div>
              <p className="text-xl md:text-2xl text-zinc-800 leading-relaxed font-medium italic mb-8">
                „Platzhalter-Zitat – hier kommt das echte Testimonial einer Pilot-Gemeinde rein. Idealerweise konkret zum Zeitgewinn oder zur Reichweite der Kleingruppen."
              </p>
              <footer className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#6b806c]/10 flex items-center justify-center text-[#6b806c] font-bold">
                  PN
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">Pastor Name</div>
                  <div className="text-sm text-zinc-500">Gemeinde XY</div>
                </div>
              </footer>
            </blockquote>
          </FadeInWhenVisible>
        </div>
      </section>

      <section className="relative py-24 px-4 overflow-hidden bg-white">
        {/* Subtle aurora echo */}
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6b806c]/10 via-transparent to-[#a5b4fc]/10" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeInWhenVisible>
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-5 tracking-tight">
              Bereit, deine Predigt zu teilen?
            </h2>
            <p className="text-lg text-zinc-600 mb-10 max-w-xl mx-auto">
              14 Tage kostenlos testen. Ohne Kreditkarte, ohne Verpflichtung.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/tool"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition"
              >
                Kostenlos testen
              </a>
              <a
                href="mailto:support@kirchenki.com"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-zinc-700 font-medium hover:text-zinc-900 transition"
              >
                Fragen? Schreib uns
              </a>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </>
  );
}
