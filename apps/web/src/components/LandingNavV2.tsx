import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Wie es funktioniert", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Tutorial", href: "#video" },
];

export function LandingNavV2() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/75 backdrop-blur-lg border-b border-zinc-200/60"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center group">
          <img
            src="/kirchenki-logo.png"
            alt="KirchenKI"
            className="h-10 w-auto"
          />
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/tool"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition"
          >
            Login
          </a>
          <a
            href="/tool"
            className="text-sm font-semibold px-4 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition"
          >
            Kostenlos testen
          </a>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 -mr-2" aria-label="Menü öffnen">
              <Menu className="w-5 h-5 text-zinc-900" strokeWidth={1.5} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="p-6 border-b border-zinc-200 flex items-center">
              <img
                src="/kirchenki-logo.png"
                alt="KirchenKI"
                className="h-10 w-auto"
              />
            </div>
            <nav className="p-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-3 text-base font-medium text-zinc-700 hover:text-zinc-900 transition"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="p-6 border-t border-zinc-200 flex flex-col gap-3">
              <a
                href="/tool"
                className="py-3 text-center text-sm font-medium text-zinc-700 border border-zinc-200 rounded-full hover:bg-zinc-50 transition"
              >
                Login
              </a>
              <a
                href="/tool"
                className="py-3 text-center text-sm font-semibold bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition"
              >
                Kostenlos testen
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
