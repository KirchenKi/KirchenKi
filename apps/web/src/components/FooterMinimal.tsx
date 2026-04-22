export function FooterMinimal() {
  return (
    <footer className="border-t border-zinc-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-500">
        <div>© 2026 KirchenKI</div>
        <div className="flex items-center gap-5">
          <a href="/impressum" className="hover:text-zinc-900 transition">Impressum</a>
          <a href="/datenschutz" className="hover:text-zinc-900 transition">Datenschutz</a>
          <a href="mailto:support@kirchenki.com" className="hover:text-zinc-900 transition">Support</a>
        </div>
      </div>
    </footer>
  );
}
