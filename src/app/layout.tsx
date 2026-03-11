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

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <LingoWrapper initialLocale={initialLocale}>{children}</LingoWrapper>
      </body>
    </html>
  );
}
