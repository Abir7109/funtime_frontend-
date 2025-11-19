"use client";

import { usePathname } from "next/navigation";

export default function AppFooter() {
  const pathname = usePathname();

  // Hide footer on the "Pick a game" screen (/games)
  if (pathname === "/games") {
    return null;
  }

  return (
    <footer className="pointer-events-none fixed bottom-3 right-4 z-50 text-xs text-foreground/70">
      <div className="pointer-events-auto rounded-full bg-black/50 px-4 py-2 shadow-lg backdrop-blur">
        <span className="font-semibold text-foreground">ABIR</span>
        <span className="mx-2 text-foreground/40">•</span>
        <span>WhatsApp: +8801919069898</span>
      </div>
    </footer>
  );
}
