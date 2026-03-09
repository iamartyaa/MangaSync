"use client";

import { useState, useRef, useCallback } from "react";
import type { MangaPanel } from "@/data/mockPanels";

interface PanelUploaderProps {
  onPanelExtracted: (panel: MangaPanel) => void;
}

type UploadStage =
  | "idle"
  | "uploading"
  | "extracting"
  | "complete"
  | "error";

/**
 * PanelUploader — Drag-and-drop manga panel upload with GPT-4o Vision extraction.
 *
 * Flow:
 * 1. User drops/selects an image
 * 2. Image is uploaded to /api/upload
 * 3. Uploaded image is sent to /api/extract for GPT-4o Vision analysis
 * 4. Extracted panel (with bubbles, context) is added to the panel selector
 */
export default function PanelUploader({ onPanelExtracted }: PanelUploaderProps) {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionInfo, setExtractionInfo] = useState<{
    title: string;
    bubbleCount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setExtractionInfo(null);

      // ── Step 1: Upload ──────────────────────────────────────────────
      setStage("uploading");

      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.details || uploadData.error);
      }

      // ── Step 2: Extract ─────────────────────────────────────────────
      setStage("extracting");

      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.imageUrl }),
      });

      const extractData = await extractRes.json();
      if (!extractRes.ok) {
        throw new Error(extractData.details || extractData.error);
      }

      // ── Step 3: Build MangaPanel ────────────────────────────────────
      const panel: MangaPanel = {
        panel_id: extractData.panel_id,
        series_title: extractData.series_title,
        manga_context: extractData.manga_context,
        image_url: uploadData.imageUrl,
        bubbles: extractData.bubbles,
      };

      setExtractionInfo({
        title: panel.series_title,
        bubbleCount: panel.bubbles.length,
      });
      setStage("complete");

      // Notify parent
      onPanelExtracted(panel);
    },
    [onPanelExtracted]
  );

  const handleFile = useCallback(
    async (file: File) => {
      try {
        await processFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStage("error");
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const reset = useCallback(() => {
    setStage("idle");
    setError(null);
    setExtractionInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── Status messages ─────────────────────────────────────────────────
  const stageMessages: Record<UploadStage, string> = {
    idle: "",
    uploading: "Uploading panel...",
    extracting: "GPT-4o is analyzing your manga panel... detecting speech bubbles, extracting text, and inferring context",
    complete: "Extraction complete!",
    error: "Something went wrong",
  };

  return (
    <div className="brutal-border-thick bg-manga-white brutal-shadow">
      {/* Header */}
      <div className="p-4 border-b-3 border-manga-black bg-manga-purple text-manga-white">
        <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest">
          Upload Your Own Panel
        </h3>
        <p className="text-xs text-manga-white/70 mt-1">
          Drop any manga panel — GPT-4o Vision detects bubbles automatically
        </p>
      </div>

      {/* Drop zone */}
      <div className="p-4">
        {stage === "idle" || stage === "error" ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative brutal-border-thick p-8 text-center cursor-pointer
              transition-all duration-200
              ${
                isDragOver
                  ? "bg-manga-purple/10 border-manga-purple scale-[1.02] brutal-shadow"
                  : "bg-manga-cream hover:bg-manga-purple/5 border-dashed"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="text-4xl mb-3">{isDragOver ? "📥" : "🖼️"}</div>
            <p className="font-[family-name:var(--font-display)] font-bold text-base text-manga-black">
              {isDragOver ? "Drop it here!" : "Drag & drop a manga panel"}
            </p>
            <p className="text-xs text-manga-muted mt-1 font-mono">
              or click to browse · JPG, PNG, WebP · Max 10MB
            </p>
          </div>
        ) : (
          /* Processing states */
          <div className="brutal-border p-6 bg-manga-cream">
            {/* Progress indicator */}
            <div className="flex items-center gap-3 mb-4">
              {stage === "complete" ? (
                <div className="w-10 h-10 bg-manga-green brutal-border flex items-center justify-center shrink-0">
                  <span className="text-lg">✓</span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-manga-purple brutal-border flex items-center justify-center shrink-0 animate-pulse">
                  <span className="text-lg text-manga-white">
                    {stage === "uploading" ? "↑" : "🔍"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-[family-name:var(--font-display)] font-bold text-sm text-manga-black">
                  {stageMessages[stage]}
                </p>
                {extractionInfo && (
                  <p className="text-xs text-manga-muted font-mono mt-0.5">
                    {extractionInfo.title} · {extractionInfo.bubbleCount} bubble
                    {extractionInfo.bubbleCount !== 1 ? "s" : ""} found
                  </p>
                )}
              </div>
            </div>

            {/* Stage progress bar */}
            <div className="w-full h-2 brutal-border bg-manga-gray overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  stage === "complete" ? "bg-manga-green" : "bg-manga-purple"
                }`}
                style={{
                  width:
                    stage === "uploading"
                      ? "33%"
                      : stage === "extracting"
                      ? "66%"
                      : "100%",
                }}
              />
            </div>

            {/* Actions */}
            {stage === "complete" && (
              <button
                onClick={reset}
                className="w-full py-2 brutal-border font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-wider bg-manga-white text-manga-black brutal-shadow brutal-hover cursor-pointer transition-all duration-150"
              >
                Upload Another Panel
              </button>
            )}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-3 p-3 brutal-border bg-manga-red/10 text-manga-red text-xs font-mono">
            <span className="font-bold">✗ Error:</span> {error}
            <button
              onClick={reset}
              className="block mt-2 underline text-manga-red/80 hover:text-manga-red"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
