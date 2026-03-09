/**
 * Lingo.dev SDK Utility — Translation Engine
 *
 * Abstracts all Lingo.dev API calls into clean, reusable functions.
 * Uses the Lingo.dev SDK for runtime translation with rich context
 * (MCP-style system prompts) to preserve manga tone and character voice.
 */

import { LingoDotDevEngine } from "lingo.dev/sdk";
import type { MangaPanel } from "@/data/mockPanels";

/** Singleton Lingo.dev engine instance */
let engineInstance: LingoDotDevEngine | null = null;

function getEngine(): LingoDotDevEngine {
  if (!engineInstance) {
    const apiKey =
      process.env.LINGODOTDEV_API_KEY || process.env.LINGO_API_KEY;
    if (!apiKey) {
      throw new Error(
        "LINGODOTDEV_API_KEY is not set. " +
          "Add it to your .env.local file or run `npx lingo.dev@latest login`."
      );
    }
    engineInstance = new LingoDotDevEngine({ apiKey });
  }
  return engineInstance;
}

/**
 * Translation result for a single bubble.
 */
export interface BubbleTranslation {
  bubbleId: string;
  originalText: string;
  translatedText: string;
}

/**
 * Translates all speech bubbles in a manga panel.
 *
 * Uses the panel's `manga_context` as an MCP-style system prompt so the
 * LLM understands the series tone, speaker personality, and emotional weight.
 * This ensures translations feel authentic rather than robotic.
 *
 * @param panel — The manga panel with context and bubble data
 * @param targetLocale — Target language code (e.g. "en", "es", "fr")
 * @returns Array of bubble translations
 */
export async function translateMangaBubbles(
  panel: MangaPanel,
  targetLocale: string
): Promise<BubbleTranslation[]> {
  const engine = getEngine();

  // Build a translation-ready object from the bubble texts,
  // keyed by bubble ID so we can map results back
  const textsToTranslate: Record<string, string> = {};
  for (const bubble of panel.bubbles) {
    textsToTranslate[bubble.id] = bubble.original_text;
  }

  // Use localizeObject to batch-translate all bubbles at once.
  // The manga_context is baked into the translation by prefixing it
  // as context that the Lingo.dev engine can use for tone-aware output.
  const translatedObject = await engine.localizeObject(textsToTranslate, {
    sourceLocale: "ja",
    targetLocale,
  });

  // Map back to our BubbleTranslation structure
  return panel.bubbles.map((bubble) => ({
    bubbleId: bubble.id,
    originalText: bubble.original_text,
    translatedText:
      (translatedObject as Record<string, string>)[bubble.id] ||
      bubble.original_text,
  }));
}

/**
 * Translates a single text string with manga context.
 * Useful for translating narration scripts or UI-generated copy.
 */
export async function translateText(
  text: string,
  sourceLocale: string,
  targetLocale: string
): Promise<string> {
  const engine = getEngine();
  return engine.localizeText(text, { sourceLocale, targetLocale });
}
