import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import LingoWrapper from "@/components/LingoWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

import { getServerLocale } from "@lingo.dev/compiler/virtual/locale/server";

// Static imports of translation caches so they are always bundled in the
// serverless function — no runtime fs access needed on Vercel.
import enCache from "@/lingo/cache/en.json";
import jaCache from "@/lingo/cache/ja.json";
import esCache from "@/lingo/cache/es.json";
import frCache from "@/lingo/cache/fr.json";

const TRANSLATION_ENTRIES: Record<string, Record<string, string>> = {
  en: enCache.entries,
  ja: jaCache.entries,
  es: esCache.entries,
  fr: frCache.entries,
};

export const metadata: Metadata = {
  title: "MangaSync — AI Manga Localization & Narration Engine",
  description:
    "Transform raw manga panels into fully translated, narrated experiences. " +
    "Powered by Lingo.dev for tone-aware, context-driven localization.",
  keywords: [
    "manga",
    "translation",
    "localization",
    "AI",
    "narration",
    "lingo.dev",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rely on Lingo.dev's generated server virtual module for exact cookie matching
  const initialLocale = await getServerLocale();

  // For non-source locales, pass the cached translations so that Client
  // Components (dashboard, etc.) can render translated text immediately
  // without needing a client-side fetch to /translations/{locale}.json.
  const initialTranslations = TRANSLATION_ENTRIES[initialLocale] ?? {};

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <LingoWrapper
          initialLocale={initialLocale}
          initialTranslations={initialTranslations}
        >
          {children}
        </LingoWrapper>
      </body>
    </html>
  );
}
