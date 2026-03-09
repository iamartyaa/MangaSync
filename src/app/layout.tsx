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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <LingoWrapper>{children}</LingoWrapper>
      </body>
    </html>
  );
}
