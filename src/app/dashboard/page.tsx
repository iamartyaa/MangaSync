"use client";

import { useState, useCallback } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PanelSelector from "@/components/PanelSelector";
import MangaViewer from "@/components/MangaViewer";
import NarrationPlayer from "@/components/NarrationPlayer";
import type { MangaPanel } from "@/data/mockPanels";
import Link from "next/link";

/** Target language options for manga translation */
const TARGET_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
];

/**
 * MangaSync Dashboard — The Core Translation & Narration Cockpit
 *
 * Flow:
 * 1. Select a manga panel from the grid
 * 2. Choose target language
 * 3. Click "Translate" → calls /api/translate
 * 4. View translated bubbles overlaid on the panel
 * 5. Click "Play Narration" → hear sequential speech with bubble highlights
 */
export default function DashboardPage() {
  // ── State ───────────────────────────────────────────────────────────────
  const [selectedPanel, setSelectedPanel] = useState<MangaPanel | null>(null);
  const [targetLocale, setTargetLocale] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [translationComplete, setTranslationComplete] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────

  /** Select a panel and reset translation state */
  const handlePanelSelect = useCallback((panel: MangaPanel) => {
    setSelectedPanel(panel);
    setTranslations({});
    setActiveBubbleId(null);
    setError(null);
    setTranslationComplete(false);
  }, []);

  /** Call the translation API */
  const handleTranslate = useCallback(async () => {
    if (!selectedPanel) return;

    setIsTranslating(true);
    setError(null);
    setTranslations({});
    setTranslationComplete(false);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panelId: selectedPanel.panel_id,
          targetLocale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Translation failed");
      }

      // Map translations to { bubbleId: translatedText }
      const translationMap: Record<string, string> = {};
      for (const t of data.translations) {
        translationMap[t.bubbleId] = t.translatedText;
      }
      setTranslations(translationMap);
      setTranslationComplete(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsTranslating(false);
    }
  }, [selectedPanel, targetLocale]);

  /** Narration callbacks */
  const handleBubbleStart = useCallback((bubbleId: string) => {
    setActiveBubbleId(bubbleId);
  }, []);

  const handleNarrationEnd = useCallback(() => {
    setActiveBubbleId(null);
  }, []);

  return (
    <main className="min-h-screen bg-manga-cream">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-manga-cream/90 backdrop-blur-sm border-b-3 border-manga-black">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-manga-red brutal-border flex items-center justify-center group-hover:bg-manga-black transition-colors">
                <span className="text-manga-white font-bold text-sm">M</span>
              </div>
              <span className="font-[family-name:var(--font-display)] font-bold text-lg text-manga-black">
                MangaSync
              </span>
            </Link>
            <span className="text-manga-muted text-sm font-mono hidden sm:inline">
              / Dashboard
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Page Header ────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-manga-black mb-2">
            Translation Studio
          </h1>
          <p className="text-manga-black/60 text-base">
            Select a manga panel, choose your target language, and watch
            Lingo.dev translate with full character context.
          </p>
        </div>

        {/* ── Panel Selector ─────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest text-manga-muted mb-4">
            Select a Panel
          </h2>
          <PanelSelector
            selectedPanelId={selectedPanel?.panel_id ?? null}
            onSelect={handlePanelSelect}
          />
        </section>

        {/* ── Main Workspace ─────────────────────────────────────────── */}
        {selectedPanel && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Manga Viewer (spans 2 cols on desktop) */}
            <div className="lg:col-span-2 space-y-4">
              <MangaViewer
                imageUrl={selectedPanel.image_url}
                bubbles={selectedPanel.bubbles}
                translations={translations}
                activeBubbleId={activeBubbleId}
                isLoading={isTranslating}
              />

              {/* Context info bar */}
              <div className="brutal-border bg-manga-dark text-manga-cream p-4">
                <h3 className="font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-widest text-manga-yellow mb-2">
                  MCP Context Prompt
                </h3>
                <p className="text-sm text-manga-cream/70 leading-relaxed font-mono">
                  {selectedPanel.manga_context}
                </p>
              </div>
            </div>

            {/* Right: Controls sidebar */}
            <div className="space-y-4">
              {/* Translation Controls */}
              <div className="brutal-border bg-manga-white p-4 brutal-shadow">
                <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest mb-4">
                  Translation Controls
                </h3>

                {/* Target language selector */}
                <label className="block mb-3">
                  <span className="text-xs font-mono text-manga-muted uppercase tracking-wider">
                    Target Language
                  </span>
                  <select
                    value={targetLocale}
                    onChange={(e) => {
                      setTargetLocale(e.target.value);
                      setTranslations({});
                      setTranslationComplete(false);
                    }}
                    className="mt-1 w-full px-3 py-2.5 brutal-border bg-manga-cream font-[family-name:var(--font-display)] font-bold text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-manga-red"
                  >
                    {TARGET_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Translate button */}
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className={`
                    w-full py-3 px-6 brutal-border-thick font-[family-name:var(--font-display)]
                    font-bold text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer
                    ${
                      isTranslating
                        ? "bg-manga-muted text-manga-white cursor-wait"
                        : "bg-manga-red text-manga-white brutal-shadow-red brutal-hover"
                    }
                  `}
                >
                  {isTranslating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⟳</span> Translating...
                    </span>
                  ) : (
                    "Translate with Lingo.dev"
                  )}
                </button>

                {/* Status */}
                {translationComplete && (
                  <div className="mt-3 p-2 brutal-border bg-manga-green/10 text-manga-green text-xs font-mono text-center">
                    ✓ Translation complete —{" "}
                    {Object.keys(translations).length} bubbles translated
                  </div>
                )}

                {error && (
                  <div className="mt-3 p-2 brutal-border bg-manga-red/10 text-manga-red text-xs font-mono">
                    ✗ {error}
                  </div>
                )}
              </div>

              {/* Narration Player */}
              <NarrationPlayer
                bubbles={selectedPanel.bubbles}
                translations={translations}
                onBubbleStart={handleBubbleStart}
                onNarrationEnd={handleNarrationEnd}
                targetLocale={targetLocale}
                hasTranslations={translationComplete}
              />

              {/* Original text reference */}
              <div className="brutal-border bg-manga-white p-4 brutal-shadow">
                <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest mb-3">
                  Original Text
                </h3>
                <div className="space-y-2">
                  {selectedPanel.bubbles.map((bubble) => (
                    <div
                      key={bubble.id}
                      className={`
                        p-2 brutal-border text-sm font-mono transition-all duration-300
                        ${
                          activeBubbleId === bubble.id
                            ? "bg-manga-red/10 border-manga-red"
                            : "bg-manga-cream"
                        }
                      `}
                    >
                      <span className="text-manga-muted text-xs">
                        {bubble.id}:
                      </span>{" "}
                      <span className="text-manga-black">
                        {bubble.original_text}
                      </span>
                      {translations[bubble.id] && (
                        <div className="mt-1 text-manga-red text-xs">
                          → {translations[bubble.id]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedPanel && (
          <div className="brutal-border-thick bg-manga-white p-12 text-center brutal-shadow">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="font-[family-name:var(--font-display)] font-bold text-2xl text-manga-black mb-2">
              Select a Panel to Begin
            </h2>
            <p className="text-manga-muted text-sm">
              Choose a manga panel from above to start the translation and
              narration engine.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
