/**
 * postbuild.mjs — Translation File Synchronizer
 *
 * The lingo.dev compiler writes translation JSON files
 * into the .next/ build directory (distDir), but the
 * client-side LingoProvider fetches them from /translations/{locale}.json
 * which maps to public/translations/.
 *
 * This script bridges the gap by copying generated translations
 * from .next/ to public/translations/ after the build completes.
 */

import fs from "fs";
import path from "path";

const LOCALES = ["en", "ja", "es", "fr"];
const NEXT_DIR = path.join(process.cwd(), ".next");
const PUBLIC_TRANSLATIONS = path.join(process.cwd(), "public", "translations");
const CACHE_DIR = path.join(process.cwd(), "src", "lingo", "cache");

console.log("\n🔍 [postbuild] Translation file diagnostics:");
console.log("─".repeat(55));

// 1. Check what's in .next/ (where lingo.dev writes them)
console.log("\n📂 Checking .next/ for generated translation files:");
for (const locale of LOCALES) {
  const p = path.join(NEXT_DIR, `${locale}.json`);
  if (fs.existsSync(p)) {
    const stats = fs.statSync(p);
    const content = JSON.parse(fs.readFileSync(p, "utf-8"));
    const entryCount = Object.keys(content.entries || {}).length;
    console.log(`   ✅ ${locale}.json — ${stats.size} bytes, ${entryCount} entries`);
  } else {
    console.log(`   ❌ ${locale}.json — NOT FOUND`);
  }
}

// 2. Check what's in src/lingo/cache/ (the dev cache)
console.log("\n📂 Checking src/lingo/cache/ (dev-time cache):");
for (const locale of LOCALES) {
  const p = path.join(CACHE_DIR, `${locale}.json`);
  if (fs.existsSync(p)) {
    const stats = fs.statSync(p);
    const content = JSON.parse(fs.readFileSync(p, "utf-8"));
    const entryCount = Object.keys(content.entries || {}).length;
    console.log(`   ✅ ${locale}.json — ${stats.size} bytes, ${entryCount} entries`);
  } else {
    console.log(`   ❌ ${locale}.json — NOT FOUND`);
  }
}

// 3. Ensure public/translations/ exists
fs.mkdirSync(PUBLIC_TRANSLATIONS, { recursive: true });

// 4. Copy from .next/ to public/translations/ (build-generated, complete)
//    Fall back to src/lingo/cache/ if .next/ files don't exist
console.log("\n📦 Copying translations to public/translations/:");
for (const locale of LOCALES) {
  const buildPath = path.join(NEXT_DIR, `${locale}.json`);
  const cachePath = path.join(CACHE_DIR, `${locale}.json`);
  const destPath = path.join(PUBLIC_TRANSLATIONS, `${locale}.json`);

  let source = null;
  if (fs.existsSync(buildPath)) {
    source = buildPath;
    console.log(`   📋 ${locale}.json ← .next/ (build-generated)`);
  } else if (fs.existsSync(cachePath)) {
    source = cachePath;
    console.log(`   📋 ${locale}.json ← src/lingo/cache/ (dev cache fallback)`);
  } else {
    console.log(`   ⚠️  ${locale}.json — no source found, skipping!`);
    continue;
  }

  fs.copyFileSync(source, destPath);
}

// 5. Final verification
console.log("\n✅ [postbuild] Final state of public/translations/:");
for (const locale of LOCALES) {
  const p = path.join(PUBLIC_TRANSLATIONS, `${locale}.json`);
  if (fs.existsSync(p)) {
    const stats = fs.statSync(p);
    const content = JSON.parse(fs.readFileSync(p, "utf-8"));
    const entryCount = Object.keys(content.entries || {}).length;
    console.log(`   ✅ ${locale}.json — ${stats.size} bytes, ${entryCount} entries`);
  } else {
    console.log(`   ❌ ${locale}.json — MISSING (this will cause 404s!)`);
  }
}

console.log("\n" + "─".repeat(55));
console.log("🏁 [postbuild] Translation sync complete!\n");
