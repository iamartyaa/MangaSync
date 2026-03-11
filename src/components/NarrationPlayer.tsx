"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { Bubble } from "@/data/mockPanels";

interface NarrationPlayerProps {
  bubbles: Bubble[];
  translations: Record<string, string>;
  onBubbleStart: (bubbleId: string) => void;
  onNarrationEnd: () => void;
  targetLocale: string;
  hasTranslations: boolean;
}

// Voices are restricted in the backend to 'fable'.

/**
 * Sort bubbles in traditional manga reading order: top-to-bottom, right-to-left.
 * Groups bubbles into rows by similar Y position, then sorts right-to-left
 * within each row.
 */
function sortBubblesInReadingOrder(bubbles: Bubble[]): Bubble[] {
  const ROW_THRESHOLD = 15; // % — bubbles within this Y range are considered on the same row

  const sorted = [...bubbles].sort((a, b) => {
    // If bubbles are on roughly the same row (within threshold)
    if (Math.abs(a.y - b.y) < ROW_THRESHOLD) {
      return b.x - a.x; // right to left (higher X comes first)
    }
    return a.y - b.y; // top to bottom
  });

  return sorted;
}

/**
 * NarrationPlayer — OpenAI TTS HD Narration Engine
 *
 * Pre-generates ALL audio for every bubble FIRST, then plays them
 * back-to-back seamlessly with synchronized bubble highlighting.
 *
 * Reading order: left-to-right, top-to-bottom (standard reading flow).
 */
export default function NarrationPlayer({
  bubbles,
  translations,
  onBubbleStart,
  onNarrationEnd,
  hasTranslations,
}: NarrationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentBubbleIndex, setCurrentBubbleIndex] = useState(-1);

  const [error, setError] = useState<string | null>(null);

  // Refs for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef(false);
  const audioUrlsRef = useRef<string[]>([]);

  // Sort bubbles in reading order
  const orderedBubbles = useMemo(
    () => sortBubblesInReadingOrder(bubbles),
    [bubbles]
  );

  // Clean up audio URLs on unmount
  useEffect(() => {
    return () => {
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /**
   * Generate TTS audio for a single text string via OpenAI API.
   * Returns a blob URL for the audio player.
   */
  const generateAudio = useCallback(
    async (text: string): Promise<string> => {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "TTS generation failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioUrlsRef.current.push(url);
      return url;
    },
    []
  );

  /**
   * Pre-generate all audio, then play back-to-back.
   * Phase 1: Generate audio for every bubble
   * Phase 2: Play sequentially with bubble highlighting
   */
  const handlePlay = useCallback(async () => {
    if (!hasTranslations || orderedBubbles.length === 0) return;

    setError(null);
    abortRef.current = false;

    // ── Phase 1: Pre-generate all audio ──────────────────────────────
    setIsGenerating(true);
    setGenerationProgress(0);

    const audioUrls: string[] = [];
    const bubblesToNarrate = orderedBubbles.filter(
      (b) => translations[b.id]?.trim()
    );

    if (bubblesToNarrate.length === 0) {
      setIsGenerating(false);
      return;
    }

    try {
      for (let i = 0; i < bubblesToNarrate.length; i++) {
        if (abortRef.current) {
          setIsGenerating(false);
          return;
        }

        const bubble = bubblesToNarrate[i];
        const text = translations[bubble.id];
        const audioUrl = await generateAudio(text);
        audioUrls.push(audioUrl);
        setGenerationProgress(((i + 1) / bubblesToNarrate.length) * 100);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Audio generation failed"
      );
      setIsGenerating(false);
      return;
    }

    if (abortRef.current) {
      setIsGenerating(false);
      return;
    }

    // ── Phase 2: Sequential playback ─────────────────────────────────
    setIsGenerating(false);
    setIsPlaying(true);

    try {
      for (let i = 0; i < bubblesToNarrate.length; i++) {
        if (abortRef.current) break;

        const bubble = bubblesToNarrate[i];

        // Highlight current bubble
        setCurrentBubbleIndex(i);
        onBubbleStart(bubble.id);

        // Play pre-generated audio
        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(audioUrls[i]);
          audioRef.current = audio;

          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error("Audio playback failed"));

          audio.play().catch(reject);
        });

        // Brief pause between bubbles for natural flow
        if (i < bubblesToNarrate.length - 1 && !abortRef.current) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(
          err instanceof Error ? err.message : "Narration playback error"
        );
      }
    } finally {
      setIsPlaying(false);
      setCurrentBubbleIndex(-1);
      onNarrationEnd();
    }
  }, [
    orderedBubbles,
    translations,
    hasTranslations,
    generateAudio,
    onBubbleStart,
    onNarrationEnd,
  ]);

  /** Stop current narration or generation */
  const handleStop = useCallback(() => {
    abortRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentBubbleIndex(-1);
    onNarrationEnd();
  }, [onNarrationEnd]);

  // ── Progress calculation ────────────────────────────────────────────
  const bubblesToNarrate = orderedBubbles.filter(
    (b) => translations[b.id]?.trim()
  );
  const playbackProgress =
    bubblesToNarrate.length > 0 && currentBubbleIndex >= 0
      ? ((currentBubbleIndex + 1) / bubblesToNarrate.length) * 100
      : 0;

  const isActive = isPlaying || isGenerating;

  return (
    <div className="brutal-border bg-manga-white p-4 brutal-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest">
          Narration Engine
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-manga-dark text-manga-yellow brutal-border">
          OpenAI TTS HD
        </span>
      </div>



      {/* Progress bar */}
      <div className="w-full h-2 brutal-border bg-manga-gray overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isGenerating
              ? "bg-manga-yellow"
              : "bg-manga-red"
          }`}
          style={{
            width: `${isGenerating ? generationProgress : playbackProgress}%`,
          }}
        />
      </div>

      {/* Status text */}
      {isGenerating && (
        <p className="text-xs font-mono text-manga-muted mb-3 text-center animate-pulse">
          🎙️ Generating all speech audio ({Math.round(generationProgress)}%)...
          Please wait
        </p>
      )}
      {isPlaying && (
        <p className="text-xs font-mono text-manga-muted mb-3 text-center">
          🔊 Playing {currentBubbleIndex + 1} of {bubblesToNarrate.length}
        </p>
      )}

      {/* Reading order info */}
      {hasTranslations && !isActive && (
        <p className="text-[10px] font-mono text-manga-muted mb-3 text-center">
          Reading order: top → bottom, right → left (manga style) ·{" "}
          {bubblesToNarrate.length} bubble
          {bubblesToNarrate.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Play/Stop button */}
      <button
        onClick={isActive ? handleStop : handlePlay}
        disabled={!hasTranslations}
        className={`
          w-full py-3 brutal-border-thick font-[family-name:var(--font-display)]
          font-bold text-sm uppercase tracking-wider transition-all duration-150
          ${
            !hasTranslations
              ? "bg-manga-gray text-manga-muted cursor-not-allowed"
              : isActive
              ? "bg-manga-dark text-manga-red brutal-shadow cursor-pointer"
              : "bg-manga-yellow text-manga-black brutal-shadow-yellow brutal-hover cursor-pointer"
          }
        `}
      >
        {!hasTranslations
          ? "Translate a panel first to enable narration"
          : isGenerating
          ? "■ Cancel Generation"
          : isPlaying
          ? "■ Stop Narration"
          : "► Play Narration"}
      </button>

      {/* Error display */}
      {error && (
        <div className="mt-2 p-2 brutal-border bg-manga-red/10 text-manga-red text-xs font-mono">
          ✗ {error}
        </div>
      )}
    </div>
  );
}
