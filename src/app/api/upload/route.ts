/**
 * POST /api/upload
 *
 * Accepts a manga panel image upload (multipart/form-data).
 * Saves to public/uploads/ and returns the public URL.
 *
 * Request: FormData with field "image" (jpg, png, webp, max 10MB)
 * Response: { imageUrl: string, filename: string }
 */

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          details: `Accepted: jpg, png, webp. Got: ${file.type}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          details: `Maximum size: 10MB. Got: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename identifier for reference (even though it's not written)
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `panel-${randomUUID().slice(0, 8)}.${ext}`;

    // Convert to Base64 directly in memory!
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create the Data URI
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    return NextResponse.json({
      imageUrl: base64Data, // Now passing the Base64 URI instead of a public path
      filename,
    });
  } catch (error) {
    console.error("[/api/upload] Upload failed:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
