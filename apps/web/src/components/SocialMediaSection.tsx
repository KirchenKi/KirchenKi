import { useState } from "react";
import {
  Upload, Film, Image as ImageIcon, Type,
  Instagram, Facebook, Youtube, Linkedin, Music2,
  Sparkles, Info, CheckCircle2, Clock, Zap
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", Icon: Instagram },
  { id: "facebook", label: "Facebook", Icon: Facebook },
  { id: "youtube", label: "YouTube Shorts", Icon: Youtube },
  { id: "tiktok", label: "TikTok", Icon: Music2 },
  { id: "linkedin", label: "LinkedIn", Icon: Linkedin },
];

export function SocialMediaSection() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [wantClips, setWantClips] = useState(true);
  const [wantImages, setWantImages] = useState(true);
  const [wantCaptions, setWantCaptions] = useState(true);
  const [highlightCount, setHighlightCount] = useState(5);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleSubmit = () => {
    console.log("Social Media Request:", {
      file: file?.name,
      wantClips,
      wantImages,
      wantCaptions,
      highlightCount,
      selectedPlatforms,
    });
  };

  const canSubmit = file && (wantClips || wantImages || wantCaptions) && selectedPlatforms.length > 0;

  const selectedOutputs = [
    wantClips && "clips",
    wantImages && "images",
    wantCaptions && "captions",
  ].filter(Boolean);

  const outputCount = {
    clips: wantClips ? highlightCount : 0,
    images: wantImages ? highlightCount : 0,
    captions: wantCaptions ? highlightCount * 3 : 0,
  };

  const platformLabels = selectedPlatforms.map(
    (id) => PLATFORMS.find((p) => p.id === id)?.label ?? id
  );

  const estimatedMinutes = Math.round(3 + highlightCount * 1.2);

  const hasAnySelection = selectedOutputs.length > 0 && selectedPlatforms.length > 0;

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6b806c]/10 text-[#6b806c] text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            Beta
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            Predigt in Social-Media-Content.
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Clips, Zitat-Bilder und Captions – automatisch aus den stärksten Momenten deiner Predigt.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-6">
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative block rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
              isDragging
                ? "border-[#6b806c] bg-[#6b806c]/5 scale-[1.01]"
                : file
                ? "border-[#6b806c] bg-white"
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <input
              type="file"
              accept="audio/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="px-8 py-12 text-center">
              {file ? (
                <>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6b806c]/10 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-[#6b806c]" strokeWidth={1.5} />
                  </div>
                  <p className="font-medium text-zinc-900 mb-1">{file.name}</p>
                  <p className="text-sm text-zinc-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB · Klick zum Ändern
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 mb-4">
                    <Upload className="w-6 h-6 text-zinc-500" strokeWidth={1.5} />
                  </div>
                  <p className="font-medium text-zinc-900 mb-1">
                    Predigt hier ablegen oder klicken
                  </p>
                  <p className="text-sm text-zinc-500">
                    MP3, MP4, WAV, PDF, DOCX – bis 2 GB
                  </p>
                </>
              )}
            </div>
          </label>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 md:p-8 mb-6">
          {/* Output Types */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-widest">
              Was soll generiert werden?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "clips", label: "Kurz-Clips", desc: "15–60s", Icon: Film, state: wantClips, setter: setWantClips },
                { id: "images", label: "Zitat-Bilder", desc: "1080×1080", Icon: ImageIcon, state: wantImages, setter: setWantImages },
                { id: "captions", label: "Captions", desc: "mit Hashtags", Icon: Type, state: wantCaptions, setter: setWantCaptions },
              ].map(({ id, label, desc, Icon, state, setter }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setter(!state)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                    state
                      ? "border-[#6b806c] bg-[#6b806c]/5"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-3 ${state ? "text-[#6b806c]" : "text-zinc-400"}`} strokeWidth={1.5} />
                  <div className="font-semibold text-sm text-zinc-900">{label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Highlight Count */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">
                Anzahl Highlights
              </h3>
              <span className="text-sm font-semibold text-[#6b806c] tabular-nums">
                {highlightCount}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={8}
              value={highlightCount}
              onChange={(e) => setHighlightCount(Number(e.target.value))}
              className="w-full h-2 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-[#6b806c]"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-2">
              <span>3</span>
              <span>8</span>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-widest">
              Plattformen
            </h3>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(({ id, label, Icon }) => {
                const active = selectedPlatforms.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePlatform(id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      active
                        ? "border-[#6b806c] bg-[#6b806c] text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mb-6 rounded-2xl border border-[#6b806c]/20 bg-gradient-to-br from-[#6b806c]/[0.04] via-white to-[#8a9f8b]/[0.06] overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#6b806c]" strokeWidth={2} />
              <span className="text-xs font-semibold text-[#6b806c] uppercase tracking-widest">
                Das bekommst du
              </span>
            </div>
            {hasAnySelection && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                Fertig in ~{estimatedMinutes} Min
              </div>
            )}
          </div>

          {hasAnySelection ? (
            <div className="px-6 py-6">
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all ${
                    wantClips ? "bg-[#6b806c]/10" : "bg-zinc-50"
                  }`}>
                    <Film className={`w-5 h-5 ${wantClips ? "text-[#6b806c]" : "text-zinc-300"}`} strokeWidth={1.5} />
                  </div>
                  <div className={`text-2xl font-bold tabular-nums ${wantClips ? "text-zinc-900" : "text-zinc-300"}`}>
                    {outputCount.clips}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {outputCount.clips === 1 ? "Clip" : "Clips"}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all ${
                    wantImages ? "bg-[#6b806c]/10" : "bg-zinc-50"
                  }`}>
                    <ImageIcon className={`w-5 h-5 ${wantImages ? "text-[#6b806c]" : "text-zinc-300"}`} strokeWidth={1.5} />
                  </div>
                  <div className={`text-2xl font-bold tabular-nums ${wantImages ? "text-zinc-900" : "text-zinc-300"}`}>
                    {outputCount.images}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {outputCount.images === 1 ? "Bild" : "Bilder"}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all ${
                    wantCaptions ? "bg-[#6b806c]/10" : "bg-zinc-50"
                  }`}>
                    <Type className={`w-5 h-5 ${wantCaptions ? "text-[#6b806c]" : "text-zinc-300"}`} strokeWidth={1.5} />
                  </div>
                  <div className={`text-2xl font-bold tabular-nums ${wantCaptions ? "text-zinc-900" : "text-zinc-300"}`}>
                    {outputCount.captions}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Captions
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100">
                <div className="text-xs text-zinc-500 mb-1.5">Optimiert für</div>
                <div className="flex flex-wrap gap-1.5">
                  {platformLabels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-xs font-medium text-zinc-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-zinc-500">
                Wähl mindestens einen Output-Typ und eine Plattform, um eine Vorschau zu sehen.
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-4 rounded-xl font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-all"
        >
          Social-Media-Content generieren
        </button>

        {/* Info Box */}
        <div className="mt-6 flex gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
          <Info className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="text-sm text-zinc-600 space-y-1">
            <p><span className="font-medium text-zinc-900">Bearbeitungszeit:</span> ca. 5–10 Minuten pro Predigt.</p>
            <p><span className="font-medium text-zinc-900">Datenschutz:</span> Deine Predigt wird nach Verarbeitung gelöscht. Keine Weitergabe an Dritte.</p>
            <p><span className="font-medium text-zinc-900">Copyright:</span> Musik in der Originalpredigt wird aus den Clips entfernt.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
