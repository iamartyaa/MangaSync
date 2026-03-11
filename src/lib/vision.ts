/**
 * GPT-4o Vision — Manga Panel Analyzer
 *
 * Sends a manga panel image to GPT-4o and extracts:
 * 1. Speech bubble bounding boxes (percentage-based coordinates)
 * 2. Japanese text from each bubble
 * 3. Inferred series context (tone, speaker, emotion)
 *
 * This replaces traditional OCR with a single multimodal LLM call
 * that understands manga layout, speech bubbles, and Japanese text.
 */

import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to your .env.local file."
      );
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

/** Extracted bubble from the vision model */
export interface ExtractedBubble {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  original_text: string;
}

/** Full extraction result from a manga panel */
export interface ExtractionResult {
  bubbles: ExtractedBubble[];
  manga_context: string;
  series_title: string;
}

/**
 * Analyze a manga panel image using GPT-4o Vision.
 *
 * Detects speech bubbles, extracts Japanese text, and infers
 * the emotional context — all in a single API call.
 *
 * @param base64Image — Base64-encoded image data (with data URI prefix)
 * @returns Structured extraction result matching our MangaPanel format
 */
export async function extractBubblesFromImage(
  base64Image: string
): Promise<ExtractionResult> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a precision manga panel analyzer. You analyze manga/comic images and extract speech bubble data with EXACT coordinate mapping. THIS IS CRITICAL for overlaying translated text directly onto the image.

Your task:
1. Identify ALL speech bubbles, thought bubbles, and floating text visible in the panel.
2. For each bubble, calculate its EXACT bounding box as PERCENTAGES (0-100) of the total image dimensions.
3. Extract the text inside each bubble exactly as written (preserve the original language).
4. Infer the emotional context: who is speaking, what tone/mood, what series genre.

Return ONLY valid JSON with this exact structure:
{
  "bubbles": [
    {
      "id": "b1",
      "x": <left edge of the graphic bubble as percentage 0-100>,
      "y": <top edge of the graphic bubble as percentage 0-100>,
      "w": <width of the graphic bubble as percentage 0-100>,
      "h": <height of the graphic bubble as percentage 0-100>,
      "original_text": "<exact text from the bubble>"
    }
  ],
  "manga_context": "<A rich, detailed description of the scene for a translator. Include tone, speaker, and emotional state.>",
  "series_title": "<Best guess at the series name, or 'Custom Panel' if unknown>"
}

CRITICAL RULES FOR COORDINATES:
- Ensure the bounding box tightly wraps the VISIBLE graphic bubble (the white circle/cloud), NOT just the text itself.
- Do NOT include empty white space outside the drawn graphic bubble.
- x,y must be the TOP-LEFT corner of the drawn bubble.
- w,h must represent the FULL width and height of the drawn bubble.
- All values MUST be numeric percentages (e.g., 25.5), not strings or pixels.
- Extract text EXACTLY as written (including kanji/kana) — do not translate it.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this manga panel. Extract all speech bubbles with highly accurate, tight bounding box coordinates (as percentages) and their original text. Infer the emotional context for translation.",
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image,
              detail: "high",
            },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("GPT-4o returned an empty response");
  }

  const parsed = JSON.parse(content) as ExtractionResult;

  // Validate and sanitize the response
  if (!parsed.bubbles || !Array.isArray(parsed.bubbles)) {
    return {
      bubbles: [],
      manga_context: parsed.manga_context || "Custom uploaded manga panel.",
      series_title: parsed.series_title || "Custom Panel",
    };
  }

  // Ensure all bubble IDs are unique and coordinates are reasonable
  const sanitizedBubbles: ExtractedBubble[] = parsed.bubbles.map(
    (bubble, index) => ({
      id: bubble.id || `b${index + 1}`,
      x: Math.max(0, Math.min(95, bubble.x || 0)),
      y: Math.max(0, Math.min(95, bubble.y || 0)),
      w: Math.max(5, Math.min(60, bubble.w || 20)),
      h: Math.max(5, Math.min(50, bubble.h || 15)),
      original_text: bubble.original_text || "",
    })
  );

  return {
    bubbles: sanitizedBubbles.filter((b) => b.original_text.trim().length > 0),
    manga_context:
      parsed.manga_context ||
      "Custom manga panel. Translate with natural, expressive language.",
    series_title: parsed.series_title || "Custom Panel",
  };
}
