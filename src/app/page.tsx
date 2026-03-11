"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/**
 * MangaSync Landing Page
 *
 * A bold, neo-brutalist hero page that immediately communicates:
 * 1. What MangaSync does (manga localization + narration)
 * 2. The Lingo.dev Compiler in action (language switcher)
 * 3. Premium visual design that wows judges at first glance
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-manga-cream">
      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-manga-cream/90 backdrop-blur-sm border-b-3 border-manga-black">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-manga-red brutal-border flex items-center justify-center">
              <span className="text-manga-white font-bold text-sm">M</span>
            </div>
            <span className="font-[family-name:var(--font-display)] font-bold text-lg text-manga-black">
              MangaSync
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 brutal-border bg-manga-yellow brutal-shadow mb-8">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-manga-black">
              Powered by Lingo.dev
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-manga-black leading-[0.95] mb-6">
            Translate.
            <br />
            <span className="text-manga-red">Narrate.</span>
            <br />
            Publish.
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-manga-black/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            The AI-powered manga localization engine that translates speech
            bubbles with full character context, overlays them onto panels, and
            generates narrated playback — all in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-manga-red text-manga-white font-[family-name:var(--font-display)] font-bold text-lg brutal-border-thick brutal-shadow-red brutal-hover uppercase tracking-wider"
            >
              Launch Dashboard →
            </Link>
            <a
              href="https://lingo.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-manga-white text-manga-black font-[family-name:var(--font-display)] font-bold text-lg brutal-border-thick brutal-shadow brutal-hover uppercase tracking-wider"
            >
              Learn About Lingo.dev
            </a>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ──────────────────────────────────────────── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Translation */}
          <div className="brutal-border-thick bg-manga-white p-6 brutal-shadow brutal-hover">
            <div className="w-12 h-12 bg-manga-red brutal-border flex items-center justify-center mb-4">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] font-bold text-xl mb-2">
              Context-Aware Translation
            </h3>
            <p className="text-manga-black/60 text-sm leading-relaxed">
              Powered by Lingo.dev SDK with MCP-style context prompts. Every
              translation preserves the character&apos;s voice, the series tone,
              and the emotional weight of the scene.
            </p>
          </div>

          {/* Card 2: Visual Overlay */}
          <div className="brutal-border-thick bg-manga-white p-6 brutal-shadow brutal-hover">
            <div className="w-12 h-12 bg-manga-yellow brutal-border flex items-center justify-center mb-4">
              <span className="text-2xl">🖼️</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] font-bold text-xl mb-2">
              Live Bubble Overlay
            </h3>
            <p className="text-manga-black/60 text-sm leading-relaxed">
              Translated text is dynamically overlaid onto manga panels with
              precise bounding-box positioning. Watch the translation appear in
              real-time with smooth animations.
            </p>
          </div>

          {/* Card 3: Narration */}
          <div className="brutal-border-thick bg-manga-white p-6 brutal-shadow brutal-hover">
            <div className="w-12 h-12 bg-manga-green brutal-border flex items-center justify-center mb-4">
              <span className="text-2xl">🎙️</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] font-bold text-xl mb-2">
              AI Narration Engine
            </h3>
            <p className="text-manga-black/60 text-sm leading-relaxed">
              One-click narrated playback using Web Speech synthesis. Each
              bubble highlights in sync as the narration reads the translated
              dialogue — ready for YouTube export.
            </p>
          </div>
        </div>
      </section>

      {/* ── Marquee Tech Strip ─────────────────────────────────────── */}
      <section className="border-t-3 border-b-3 border-manga-black bg-manga-black py-3 overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 20s linear infinite" }}>
          {Array(3)
            .fill([
              "LINGO.DEV SDK",
              "LINGO.DEV COMPILER",
              "LINGO.DEV MCP",
              "NEXT.JS 15",
              "WEB SPEECH API",
              "TYPESCRIPT",
              "TAILWIND CSS",
            ])
            .flat()
            .map((tech, i) => (
              <span
                key={i}
                className="mx-6 font-[family-name:var(--font-display)] text-manga-cream/80 text-sm font-bold tracking-widest"
              >
                {tech} ✦
              </span>
            ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 text-center">
        <p className="text-manga-muted text-sm font-mono">
          Built for the Lingo.dev Hackathon · MangaSync © 2026
        </p>
      </footer>
    </main>
  );
}
