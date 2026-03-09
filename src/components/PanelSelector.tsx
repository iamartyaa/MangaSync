"use client";

import { mockPanels, type MangaPanel } from "@/data/mockPanels";
import Image from "next/image";

interface PanelSelectorProps {
  selectedPanelId: string | null;
  onSelect: (panel: MangaPanel) => void;
}

/**
 * Thumbnail grid for selecting which manga panel to translate.
 * Each card shows the series title and a preview thumbnail.
 */
export default function PanelSelector({
  selectedPanelId,
  onSelect,
}: PanelSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {mockPanels.map((panel, i) => {
        const isSelected = selectedPanelId === panel.panel_id;
        return (
          <button
            key={panel.panel_id}
            onClick={() => onSelect(panel)}
            className={`
              group relative brutal-border p-3 text-left
              transition-all duration-200 cursor-pointer
              ${
                isSelected
                  ? "bg-manga-red text-manga-white brutal-shadow-red scale-[1.02]"
                  : "bg-manga-white text-manga-black brutal-shadow brutal-hover"
              }
            `}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-[4/3] brutal-border overflow-hidden mb-3 bg-manga-dark">
              <Image
                src={panel.image_url}
                alt={`${panel.series_title} panel`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>

            {/* Title & metadata */}
            <h3 className="font-[family-name:var(--font-display)] font-bold text-lg leading-tight">
              {panel.series_title}
            </h3>
            <p
              className={`text-xs mt-1 font-mono ${
                isSelected ? "text-manga-cream/70" : "text-manga-muted"
              }`}
            >
              {panel.bubbles.length} bubble{panel.bubbles.length > 1 ? "s" : ""}{" "}
              · {panel.panel_id}
            </p>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-manga-yellow brutal-border flex items-center justify-center">
                <span className="text-manga-black text-xs font-bold">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
