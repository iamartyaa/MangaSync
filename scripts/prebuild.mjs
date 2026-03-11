/**
 * prebuild.mjs — Translation File Synchronizer
 *
 * The lingo.dev compiler writes complete translation JSON files
 * to the .next/ build directory during `next build`, but Vercel
 * collects static files from `public/` *before* the build finishes.
 *
 * This script ensures that `public/translations/` is pre-populated
 * with the latest `src/lingo/cache/` (dev cache) translations BEFORE
 * the build step so Vercel can serve them in production.
 */

import fs from "fs";
import path from "path";

const LOCALES = ["en", "ja", "es", "fr"];
const PUBLIC_TRANSLATIONS = path.join(process.cwd(), "public", "translations");
const CACHE_DIR = path.join(process.cwd(), "src", "lingo", "cache");

console.log("\n🔍 [prebuild] Translation file synchronization:");
console.log("─".repeat(55));

// 1. Ensure public/translations/ exists
fs.mkdirSync(PUBLIC_TRANSLATIONS, { recursive: true });

// 2. Check dev cache and copy to public
console.log("\n📦 Copying translations to public/translations/:");
for (const locale of LOCALES) {
  const cachePath = path.join(CACHE_DIR, `${locale}.json`);
  const destPath = path.join(PUBLIC_TRANSLATIONS, `${locale}.json`);

  if (fs.existsSync(cachePath)) {
    fs.copyFileSync(cachePath, destPath);
    const stats = fs.statSync(destPath);
    const content = JSON.parse(fs.readFileSync(destPath, "utf-8"));
    const entryCount = Object.keys(content.entries || {}).length;
    console.log(`   ✅ ${locale}.json ← src/lingo/cache/ (${stats.size} bytes, ${entryCount} entries)`);
  } else {
    console.log(`   ⚠️  ${locale}.json — not found in cache, skipping!`);
  }
}

console.log("\n" + "─".repeat(55));
console.log("🏁 [prebuild] Translation sync complete!\n");
