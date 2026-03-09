"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Bubble } from "@/data/mockPanels";

interface NarrationPlayerProps {
  bubbles: Bubble[];
  translations: Record<string, string>;
  onBubbleStart: (bubbleId: string) => void;
  onNarrationEnd: () => void;
  targetLocale: string;
  hasTranslations: boolean;
}

/** OpenAI TTS voice options with personality descriptions */
const VOICES = [
  { id: "nova", label: "Nova", desc: "Warm & expressive" },
  { id: "onyx", label: "Onyx", desc: "Deep & authoritative" },
  { id: "fable", label: "Fable", desc: "Storytelling" },
  { id: "shimmer", label: "Shimmer", desc: "Clear & bright" },
  { id: "echo", label: "Echo", desc: "Smooth & calm" },
  { id: "alloy", label: "Alloy", desc: "Neutral & balanced" },
] as const;

/**
 * NarrationPlayer — OpenAI TTS HD Narration Engine
 *
 * Converts translated manga dialogue into natural, human-like speech
 * using OpenAI's tts-1-hd model. Plays bubbles sequentially with
 * synchronized highlighting on the manga panel.
 *
 * Features:
 * - 6 AI voice options (Nova, Onyx, Fable, Shimmer, Echo, Alloy)
 * - Sequential playback with bubble-by-bubble highlighting
 * - Progress bar tracking current bubble
 * - Smooth audio transitions between bubbles
 */
export default function NarrationPlayer({
  bubbles,
  translations,
  onBubbleStart,
  onNarrationEnd,
  hasTranslations,
}: NarrationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentBubbleIndex, setCurrentBubbleIndex] = useState(-1);
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const [error, setError] = useState<string | null>(null);

  // Refs for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef(false);
  const audioUrlsRef = useRef<string[]>([]);

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
        body: JSON.stringify({ text, voice: selectedVoice }),
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
    [selectedVoice]
  );

  /**
   * Play narration for all translated bubbles sequentially.
   * Each bubble is highlighted as its audio plays.
   */
  const handlePlay = useCallback(async () => {
    if (!hasTranslations || bubbles.length === 0) return;

    setIsPlaying(true);
    setError(null);
    abortRef.current = false;

    try {
      for (let i = 0; i < bubbles.length; i++) {
        if (abortRef.current) break;

        const bubble = bubbles[i];
        const text = translations[bubble.id];
        if (!text) continue;

        // Update UI state
        setCurrentBubbleIndex(i);
        onBubbleStart(bubble.id);

        // Generate audio
        setIsLoading(true);
        const audioUrl = await generateAudio(text);
        setIsLoading(false);

        if (abortRef.current) break;

        // Play audio and wait for completion
        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error("Audio playback failed"));

          audio.play().catch(reject);
        });

        // Small pause between bubbles for natural flow
        if (i < bubbles.length - 1 && !abortRef.current) {
          await new Promise((r) => setTimeout(r, 400));
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
      setIsLoading(false);
      setCurrentBubbleIndex(-1);
      onNarrationEnd();
    }
  }, [
    bubbles,
    translations,
    hasTranslations,
    generateAudio,
    onBubbleStart,
    onNarrationEnd,
  ]);

  /** Stop current narration */
  const handleStop = useCallback(() => {
    abortRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentBubbleIndex(-1);
    onNarrationEnd();
  }, [onNarrationEnd]);

  // ── Progress calculation ────────────────────────────────────────────
  const progress =
    bubbles.length > 0 && currentBubbleIndex >= 0
      ? ((currentBubbleIndex + 1) / bubbles.length) * 100
      : 0;

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

      {/* Voice selector */}
      <div className="mb-3">
        <label className="text-xs font-mono text-manga-muted uppercase tracking-wider block mb-1.5">
          AI Voice
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              disabled={isPlaying}
              className={`
                px-2 py-1.5 brutal-border text-left transition-all duration-150 cursor-pointer
                ${
                  selectedVoice === voice.id
                    ? "bg-manga-purple text-manga-white"
                    : "bg-manga-cream text-manga-black hover:bg-manga-purple/10"
                }
                ${isPlaying ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <span className="font-[family-name:var(--font-display)] font-bold text-xs block">
                {voice.label}
              </span>
              <span
                className={`text-[9px] font-mono ${
                  selectedVoice === voice.id
                    ? "text-manga-white/70"
                    : "text-manga-muted"
                }`}
              >
                {voice.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 brutal-border bg-manga-gray overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isLoading ? "bg-manga-yellow animate-pulse" : "bg-manga-red"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status text */}
      {isPlaying && (
        <p className="text-xs font-mono text-manga-muted mb-3 text-center">
          {isLoading
            ? `Generating speech for bubble ${currentBubbleIndex + 1}/${bubbles.length}...`
            : `Playing ${currentBubbleIndex + 1} of ${bubbles.length}`}
        </p>
      )}

      {/* Play/Stop button */}
      <button
        onClick={isPlaying ? handleStop : handlePlay}
        disabled={!hasTranslations}
        className={`
          w-full py-3 brutal-border-thick font-[family-name:var(--font-display)]
          font-bold text-sm uppercase tracking-wider transition-all duration-150
          ${
            !hasTranslations
              ? "bg-manga-gray text-manga-muted cursor-not-allowed"
              : isPlaying
              ? "bg-manga-dark text-manga-red brutal-shadow cursor-pointer"
              : "bg-manga-yellow text-manga-black brutal-shadow-yellow brutal-hover cursor-pointer"
          }
        `}
      >
        {!hasTranslations
          ? "Translate a panel first to enable narration"
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
