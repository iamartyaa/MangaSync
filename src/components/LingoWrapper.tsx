"use client";

import { LingoProvider } from "@lingo.dev/compiler/react";
import { useRouter } from "next/navigation";

/**
 * Client-side wrapper for LingoProvider.
 * Passes the Next.js router to enable Server Component re-rendering
 * on locale change.
 */
export default function LingoWrapper({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: any;
}) {
  const router = useRouter();

  // Disable Lingo widget in production builds
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <LingoProvider
      initialLocale={initialLocale}
      router={router}
      devWidget={{ enabled: isDev, position: "bottom-right" }}
    >
      {children}
    </LingoProvider>
  );
}
