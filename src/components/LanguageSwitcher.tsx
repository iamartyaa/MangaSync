"use client";

import { useLingoContext } from "@lingo.dev/compiler/react";
import { useState } from "react";

const LOCALE_LABELS: Record<string, string> = {
  en: "🇺🇸 EN",
  ja: "🇯🇵 JA",
  es: "🇪🇸 ES",
  fr: "🇫🇷 FR",
};

/**
 * Language switcher demonstrating the Lingo.dev Compiler's
 * seamless UI localization. Shows a loading spinner and disables
 * all buttons while translations are loading to prevent overlapping requests.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale } = useLingoContext();
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);

  const isSwitching = pendingLocale !== null;

  const handleSwitch = async (code: string) => {
    if (code === locale || isSwitching) return;
    setPendingLocale(code);
    try {
      await setLocale(code as any);
    } finally {
      setPendingLocale(null);
    }
  };

  return (
    <div className="flex items-center gap-1 relative">
      {Object.entries(LOCALE_LABELS).map(([code, label]) => {
        const isActive = locale === code;
        const isTarget = pendingLocale === code;

        return (
          <button
            key={code}
            onClick={() => handleSwitch(code)}
            disabled={isSwitching && !isActive}
            className={`
              px-3 py-1.5 text-sm font-bold font-[family-name:var(--font-display)]
              brutal-border transition-all duration-150
              ${
                isActive
                  ? "bg-manga-red text-manga-white brutal-shadow-red"
                  : isTarget
                  ? "bg-manga-yellow text-manga-black brutal-shadow-yellow animate-pulse"
                  : isSwitching
                  ? "bg-manga-gray text-manga-muted cursor-not-allowed opacity-50"
                  : "bg-manga-white text-manga-black brutal-shadow brutal-hover cursor-pointer"
              }
            `}
            aria-label={`Switch language to ${code}`}
          >
            {isTarget ? (
              <span className="flex items-center gap-1">
                <span className="inline-block animate-spin text-xs">⟳</span>
                {label.split(" ")[1]}
              </span>
            ) : (
              label
            )}
          </button>
        );
      })}
    </div>
  );
}
