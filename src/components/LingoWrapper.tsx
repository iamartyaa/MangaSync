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
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <LingoProvider
      initialLocale="en"
      router={router}
      devWidget={{ enabled: true, position: "bottom-right" }}
    >
      {children}
    </LingoProvider>
  );
}
