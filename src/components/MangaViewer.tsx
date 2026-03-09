"use client";

import Image from "next/image";
import type { Bubble } from "@/data/mockPanels";

interface MangaViewerProps {
  /** URL of the raw manga panel image */
  imageUrl: string;
  /** Speech bubble positions and original text */
  bubbles: Bubble[];
  /** Map of bubble ID → translated text (empty until translation completes) */
  translations: Record<string, string>;
  /** Bubble ID currently being narrated (null if not narrating) */
  activeBubbleId: string | null;
  /** Whether translation is currently loading */
  isLoading: boolean;
}

/**
 * The MangaViewer renders a manga panel image with speech bubble overlays.
 *
 * Bubbles are positioned absolutely using percentage-based coordinates.
 * During translation loading, bubbles show a skeleton pulse animation.
 * During narration, the active bubble gets a glowing red highlight.
 */
export default function MangaViewer({
  imageUrl,
  bubbles,
  translations,
  activeBubbleId,
  isLoading,
}: MangaViewerProps) {
  return (
    <div className="relative w-full brutal-border-thick brutal-shadow-lg overflow-hidden bg-manga-dark">
      {/* Manga panel image */}
      <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
        <Image
          src={imageUrl}
          alt="Manga panel"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />

        {/* Speech bubble overlays */}
        {bubbles.map((bubble, index) => {
          const hasTranslation = translations[bubble.id] !== undefined;
          const isActive = activeBubbleId === bubble.id;

          return (
            <div
              key={bubble.id}
              className={`
                absolute flex items-center justify-center p-2 sm:p-3
                transition-all duration-500 ease-out z-10
                ${
                  isActive
                    ? "bubble-active brutal-border-thick bg-white/95"
                    : "brutal-border bg-white/85 hover:bg-white/95"
                }
                ${hasTranslation ? "text-reveal" : ""}
              `}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: `${bubble.w}%`,
                height: `${bubble.h}%`,
                animationDelay: `${index * 200}ms`,
                borderRadius: "12px",
              }}
            >
              {isLoading ? (
                /* Skeleton loader during translation */
                <div className="w-full space-y-1.5">
                  <div className="h-3 skeleton-pulse rounded-sm w-full" />
                  <div className="h-3 skeleton-pulse rounded-sm w-3/4" />
                </div>
              ) : hasTranslation ? (
                /* Translated text */
                <p
                  className={`
                    text-center font-bold leading-tight
                    font-[family-name:var(--font-display)]
                    text-manga-black text-xs sm:text-sm md:text-base
                    ${isActive ? "text-manga-red" : ""}
                  `}
                >
                  {translations[bubble.id]}
                </p>
              ) : (
                /* Original Japanese text (before translation) */
                <p className="text-center font-bold text-manga-black/60 text-xs sm:text-sm leading-tight">
                  {bubble.original_text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
