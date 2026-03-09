/**
 * POST /api/extract
 *
 * Analyzes a manga panel image using GPT-4o Vision to extract
 * speech bubble positions, text, and emotional context.
 *
 * Request body: { imageUrl: string } (URL of an uploaded panel)
 *   OR: { imageBase64: string } (base64-encoded image data)
 *
 * Response: {
 *   panel_id: string,
 *   series_title: string,
 *   manga_context: string,
 *   image_url: string,
 *   bubbles: ExtractedBubble[]
 * }
 */

import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { extractBubblesFromImage } from "@/lib/vision";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, imageBase64 } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        {
          error: "Missing image data",
          details: "Provide either `imageUrl` (for uploaded files) or `imageBase64`.",
        },
        { status: 400 }
      );
    }

    let base64Data: string;

    if (imageBase64) {
      // Directly provided base64 data
      base64Data = imageBase64;
    } else {
      // Read the uploaded file from public/ and convert to base64
      const filePath = path.join(process.cwd(), "public", imageUrl);
      const fileBuffer = await readFile(filePath);

      // Determine MIME type from extension
      const ext = imageUrl.split(".").pop()?.toLowerCase() || "jpg";
      const mimeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
      };
      const mime = mimeMap[ext] || "image/jpeg";

      base64Data = `data:${mime};base64,${fileBuffer.toString("base64")}`;
    }

    // Extract bubbles using GPT-4o Vision
    const extraction = await extractBubblesFromImage(base64Data);

    // Build a MangaPanel-compatible response
    const panelId = `custom_${randomUUID().slice(0, 8)}`;

    return NextResponse.json({
      panel_id: panelId,
      series_title: extraction.series_title,
      manga_context: extraction.manga_context,
      image_url: imageUrl || "/uploads/inline-upload.jpg",
      bubbles: extraction.bubbles,
      bubble_count: extraction.bubbles.length,
    });
  } catch (error) {
    console.error("[/api/extract] Extraction failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown extraction error";

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          details: message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Extraction failed",
        details: message,
      },
      { status: 500 }
    );
  }
}
