import type { NextConfig } from "next";
import { withLingo } from "@lingo.dev/compiler/next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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
