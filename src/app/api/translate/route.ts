/**
 * POST /api/translate
 *
 * Translates manga speech bubbles using the Lingo.dev SDK.
 *
 * Request body:
 *   { panelId: string, targetLocale: string }
 *
 * Response:
 *   { translations: { bubbleId: string, originalText: string, translatedText: string }[] }
 *
 * Error responses:
 *   400 — Missing panelId or targetLocale
 *   404 — Panel not found in mock data
 *   500 — Translation engine error
 */

import { NextResponse } from "next/server";
import { mockPanels } from "@/data/mockPanels";
import { translateMangaBubbles } from "@/lib/lingo";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { panelId, targetLocale } = body;

    // ── Validate input ──────────────────────────────────────────────────
    if (!panelId || !targetLocale) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Both `panelId` and `targetLocale` are required.",
        },
        { status: 400 }
      );
    }

    // ── Find the panel ──────────────────────────────────────────────────
    const panel = mockPanels.find((p) => p.panel_id === panelId);
    if (!panel) {
      return NextResponse.json(
        {
          error: "Panel not found",
          details: `No panel with ID "${panelId}" exists in the demo data.`,
        },
        { status: 404 }
      );
    }

    // ── Translate using Lingo.dev SDK ───────────────────────────────────
    const translations = await translateMangaBubbles(panel, targetLocale);

    return NextResponse.json({
      panelId: panel.panel_id,
      seriesTitle: panel.series_title,
      targetLocale,
      translations,
    });
  } catch (error) {
    console.error("[/api/translate] Translation failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown translation error";

    // Surface a user-friendly error for missing API key
    if (message.includes("LINGODOTDEV_API_KEY")) {
      return NextResponse.json(
        {
          error: "API key not configured",
          details: message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Translation failed",
        details: message,
      },
      { status: 500 }
    );
  }
}
