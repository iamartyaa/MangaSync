"use client";

import { useLingoContext } from "@lingo.dev/compiler/react";

const LOCALE_LABELS: Record<string, string> = {
  en: "🇺🇸 EN",
  ja: "🇯🇵 JA",
  es: "🇪🇸 ES",
  fr: "🇫🇷 FR",
};

/**
 * Language switcher demonstrating the Lingo.dev Compiler's
 * seamless UI localization. Toggles the entire app's language
 * without any page reload or t() wrappers.
 *
 * Uses `useLingoContext()` which provides `locale` and `setLocale`.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale } = useLingoContext();

  return (
    <div className="flex items-center gap-1">
      {Object.entries(LOCALE_LABELS).map(([code, label]) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`
            px-3 py-1.5 text-sm font-bold font-[family-name:var(--font-display)]
            brutal-border transition-all duration-150 cursor-pointer
            ${
              locale === code
                ? "bg-manga-red text-manga-white brutal-shadow-red"
                : "bg-manga-white text-manga-black brutal-shadow brutal-hover"
            }
          `}
          aria-label={`Switch language to ${code}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
