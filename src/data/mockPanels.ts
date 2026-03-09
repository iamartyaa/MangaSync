/**
 * Mock manga panel data — simulates OCR extraction output.
 *
 * Each panel contains:
 * - Metadata (series context, tone, speaker)
 * - Bounding-box coordinates for speech bubbles (percentage-based)
 * - Original Japanese text extracted from the panel
 *
 * Coordinates are percentages of the image dimensions so the overlay
 * system is resolution-independent.
 */

export interface Bubble {
  /** Unique bubble identifier */
  id: string;
  /** X offset from left edge (%) */
  x: number;
  /** Y offset from top edge (%) */
  y: number;
  /** Width of bubble region (%) */
  w: number;
  /** Height of bubble region (%) */
  h: number;
  /** Original Japanese text */
  original_text: string;
}

export interface MangaPanel {
  /** Unique panel identifier */
  panel_id: string;
  /** Series title for display */
  series_title: string;
  /** Contextual description passed to the LLM for tone-aware translation */
  manga_context: string;
  /** Path to the raw manga panel image */
  image_url: string;
  /** Array of speech bubble regions with original text */
  bubbles: Bubble[];
}

export const mockPanels: MangaPanel[] = [
  {
    panel_id: "aot_ch130",
    series_title: "Attack on Titan",
    manga_context:
      "Attack on Titan, Chapter 130. The scene is dark, violent, and apocalyptic. " +
      "The speaker is Eren Jaeger — once a frightened boy, now a merciless avenger " +
      "who has unlocked the power of the Founding Titan. He speaks with cold fury " +
      "and absolute conviction. His words drip with hatred toward the Titans who " +
      "devoured his mother. Preserve the raw, guttural intensity. Do not soften " +
      "the language — this is a declaration of genocide.",
    image_url: "/demo-assets/aot-raw.jpg",
    bubbles: [
      {
        id: "b1",
        x: 8,
        y: 10,
        w: 36,
        h: 18,
        original_text: "駆逐してやる...!!",
      },
      {
        id: "b2",
        x: 52,
        y: 55,
        w: 40,
        h: 22,
        original_text: "この世から...一匹残らず!!",
      },
    ],
  },
  {
    panel_id: "haikyuu_ch1",
    series_title: "Haikyuu!!",
    manga_context:
      "Haikyuu!!, Chapter 1. A bright, energetic sports manga about high school " +
      "volleyball. The speaker is Shoyo Hinata — a short but explosively athletic " +
      "first-year who refuses to let his height define him. He screams with pure " +
      "joy and defiance. The tone is triumphant and electrifying. Capture the " +
      "youthful exuberance and competitive fire in the translation.",
    image_url: "/demo-assets/haikyuu-raw.jpg",
    bubbles: [
      {
        id: "b3",
        x: 25,
        y: 12,
        w: 50,
        h: 20,
        original_text: "おれは飛べる!!",
      },
    ],
  },
  {
    panel_id: "dn_ch1",
    series_title: "Death Note",
    manga_context:
      "Death Note, Chapter 1. A psychological thriller with a dark, cerebral tone. " +
      "The speaker is Light Yagami — a genius honor student who has just discovered " +
      "a supernatural notebook that kills anyone whose name is written in it. He " +
      "speaks with chilling calm and god-complex arrogance. The translation must " +
      "feel calculated, menacing, and intellectually superior.",
    image_url: "/demo-assets/deathnote-raw.jpg",
    bubbles: [
      {
        id: "b4",
        x: 10,
        y: 8,
        w: 42,
        h: 16,
        original_text: "僕は新世界の神になる",
      },
      {
        id: "b5",
        x: 48,
        y: 60,
        w: 44,
        h: 20,
        original_text: "このノートに名前を書かれた人間は死ぬ",
      },
    ],
  },
];
