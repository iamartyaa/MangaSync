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
        content: `You are a manga panel analyzer. You analyze manga/comic images and extract speech bubble data.

Your task:
1. Identify ALL speech bubbles and thought bubbles visible in the panel
2. For each bubble, estimate its bounding box as PERCENTAGES of the total image dimensions
3. Extract the text inside each bubble exactly as written (preserve the original language)
4. Infer the emotional context: who is speaking, what tone/mood, what series genre

Return ONLY valid JSON with this exact structure:
{
  "bubbles": [
    {
      "id": "b1",
      "x": <left edge as percentage 0-100>,
      "y": <top edge as percentage 0-100>,
      "w": <width as percentage 0-100>,
      "h": <height as percentage 0-100>,
      "original_text": "<exact text from the bubble>"
    }
  ],
  "manga_context": "<A rich, detailed description of the scene for a translator. Include: the genre/tone of the manga, who appears to be speaking, their emotional state, any visual cues about the intensity of the scene. Write this as translation instructions that preserve the original feeling. Be vivid and specific — do NOT write generic instructions.>",
  "series_title": "<Best guess at the series name, or 'Custom Panel' if unknown>"
}

Rules:
- Coordinates are PERCENTAGES (0-100), not pixels
- x,y is the top-left corner of the bubble region
- Include ALL visible text bubbles, even small ones
- If there are no bubbles or no text, return empty bubbles array
- The manga_context should be detailed enough for an AI translator to preserve tone
- Extract text EXACTLY as written — do not translate it`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this manga panel. Extract all speech bubbles with their positions and text. Infer the emotional context for translation.",
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
