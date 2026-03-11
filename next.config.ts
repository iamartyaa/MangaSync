import type { NextConfig } from "next";
import { withLingo } from "@lingo.dev/compiler/next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Include Lingo.dev compiler-generated translation files in each
  // serverless function so the server-side useTranslation hook can
  // read them via readFromFilesystem() on Vercel.
  outputFileTracingIncludes: {
    "/*": ["./.next/ja.json", "./.next/es.json", "./.next/fr.json"],
  },
};

export default async function (): Promise<NextConfig> {
  return await withLingo(nextConfig, {
    sourceRoot: "./src",
    sourceLocale: "en",
    targetLocales: ["ja", "es", "fr"],
    models: "lingo.dev",
  });
}
