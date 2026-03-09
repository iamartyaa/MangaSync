/**
 * POST /api/translate
 *
 * Translates manga speech bubbles using the Lingo.dev SDK.
 *
 * Supports two modes:
 * 1. Mock panel: { panelId: string, targetLocale: string }
 * 2. Custom panel: { customPanel: MangaPanel, targetLocale: string }
 *
 * Response:
 *   { translations: { bubbleId, originalText, translatedText }[] }
 */

import { NextResponse } from "next/server";
import { mockPanels, type MangaPanel } from "@/data/mockPanels";
import { translateMangaBubbles } from "@/lib/lingo";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { panelId, customPanel, targetLocale } = body;

    // ── Validate input ──────────────────────────────────────────────────
    if (!targetLocale) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "`targetLocale` is required.",
        },
        { status: 400 }
      );
    }

    if (!panelId && !customPanel) {
      return NextResponse.json(
        {
          error: "Missing panel data",
          details: "Provide either `panelId` (for demo panels) or `customPanel` (for uploaded panels).",
        },
        { status: 400 }
      );
    }

    // ── Resolve the panel ───────────────────────────────────────────────
    let panel: MangaPanel;

    if (customPanel) {
      // Custom uploaded panel — use the data directly
      panel = customPanel as MangaPanel;
    } else {
      // Look up in mock data
      const found = mockPanels.find((p) => p.panel_id === panelId);
      if (!found) {
        return NextResponse.json(
          {
            error: "Panel not found",
            details: `No panel with ID "${panelId}" exists in the demo data.`,
          },
          { status: 404 }
        );
      }
      panel = found;
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

    if (message.includes("LINGODOTDEV_API_KEY")) {
      return NextResponse.json(
        { error: "API key not configured", details: message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Translation failed", details: message },
      { status: 500 }
    );
  }
}
