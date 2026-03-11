/**
 * POST /api/narrate
 *
 * Generates human-like speech audio from text using OpenAI's TTS API.
 * Returns an audio stream (MP3) that sounds natural and expressive —
 * vastly superior to browser SpeechSynthesis.
 *
 * Request body: { text: string, voice?: string }
 * Response: Audio stream (audio/mpeg)
 *
 * Available voice is fixed to 'fable' — an expressive, storytelling voice 
 * suited perfectly for the manga context narration.
 */

import { NextResponse } from "next/server";
import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set.");
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing `text` field" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();

    // ── Generation: OpenAI TTS HD ──────────────────────────────────────
    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "fable",
      input: text,
      speed: 1.0,
    });

    // Stream the audio back as MP3
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[/api/narrate] TTS failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown TTS error";

    return NextResponse.json(
      { error: "Narration failed", details: message },
      { status: 500 }
    );
  }
}
