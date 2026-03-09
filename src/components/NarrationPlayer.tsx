"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Bubble } from "@/data/mockPanels";

interface NarrationPlayerProps {
  /** Translated bubbles in reading order */
  bubbles: Bubble[];
  /** Map of bubble ID → translated text */
  translations: Record<string, string>;
  /** Callback fired when a bubble starts being narrated */
  onBubbleStart: (bubbleId: string) => void;
  /** Callback fired when narration finishes completely */
  onNarrationEnd: () => void;
  /** Target locale for voice selection */
  targetLocale: string;
  /** Whether there are translations available to narrate */
  hasTranslations: boolean;
}

/**
 * NarrationPlayer uses the Web Speech API to read translated text aloud.
 * It narrates each bubble sequentially and fires callbacks so the
 * MangaViewer can highlight the active bubble in sync.
 */
export default function NarrationPlayer({
  bubbles,
  translations,
  onBubbleStart,
  onNarrationEnd,
  targetLocale,
  hasTranslations,
}: NarrationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  /** Pick the best voice for the target language */
  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    // Try to find a voice matching the target locale
    const localeMap: Record<string, string> = {
      en: "en",
      es: "es",
      fr: "fr",
      ja: "ja",
      de: "de",
    };
    const lang = localeMap[targetLocale] || "en";
    return (
      voices.find((v) => v.lang.startsWith(lang) && v.localService) ||
      voices.find((v) => v.lang.startsWith(lang)) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  }, [targetLocale]);

  /** Narrate a single bubble, returning a Promise that resolves when done */
  const narrateBubble = useCallback(
    (bubbleId: string, text: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!synthRef.current) {
          reject(new Error("SpeechSynthesis not available"));
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getVoice();
        if (voice) utterance.voice = voice;

        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          onBubbleStart(bubbleId);
        };

        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          if (e.error === "cancelled") resolve();
          else reject(e);
        };

        synthRef.current.speak(utterance);
      });
    },
    [getVoice, onBubbleStart]
  );

  /** Start sequential narration of all translated bubbles */
  const play = useCallback(async () => {
    if (!hasTranslations) return;

    setIsPlaying(true);
    setCurrentIndex(0);
    setProgress(0);

    const translatedBubbles = bubbles.filter((b) => translations[b.id]);

    for (let i = 0; i < translatedBubbles.length; i++) {
      // Check if cancelled
      if (!synthRef.current || synthRef.current.paused) break;

      const bubble = translatedBubbles[i];
      setCurrentIndex(i);
      setProgress(((i + 1) / translatedBubbles.length) * 100);

      try {
        await narrateBubble(bubble.id, translations[bubble.id]);
        // Brief pause between bubbles for dramatic effect
        await new Promise((res) => setTimeout(res, 400));
      } catch {
        break;
      }
    }

    setIsPlaying(false);
    setProgress(100);
    onNarrationEnd();
  }, [bubbles, translations, hasTranslations, narrateBubble, onNarrationEnd]);

  /** Stop narration */
  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsPlaying(false);
    setCurrentIndex(0);
    setProgress(0);
    onNarrationEnd();
  }, [onNarrationEnd]);

  const translatedCount = bubbles.filter((b) => translations[b.id]).length;

  return (
    <div className="brutal-border bg-manga-white p-4 brutal-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest">
          Narration Engine
        </h3>
        {isPlaying && (
          <span className="text-xs font-mono text-manga-red animate-pulse">
            ● LIVE — Bubble {currentIndex + 1}/{translatedCount}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 brutal-border bg-manga-gray mb-4 overflow-hidden">
        <div
          className="h-full bg-manga-red transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={isPlaying ? stop : play}
          disabled={!hasTranslations}
          className={`
            flex-1 py-3 px-6 brutal-border-thick font-[family-name:var(--font-display)]
            font-bold text-sm uppercase tracking-wider
            transition-all duration-150 cursor-pointer
            ${
              !hasTranslations
                ? "bg-manga-gray text-manga-muted cursor-not-allowed"
                : isPlaying
                ? "bg-manga-red text-manga-white brutal-shadow-red brutal-hover"
                : "bg-manga-yellow text-manga-black brutal-shadow brutal-hover"
            }
          `}
        >
          {isPlaying ? "■ Stop Narration" : "▶ Play Narration"}
        </button>
      </div>

      {!hasTranslations && (
        <p className="text-xs text-manga-muted mt-2 text-center font-mono">
          Translate a panel first to enable narration
        </p>
      )}
    </div>
  );
}
