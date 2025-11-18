"use client";

import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";
import chessStartAnimation from "@/animations/chess-start.json";

interface ChessStartAnimationProps {
  /**
   * Called after the animation finishes (or when the overlay should be hidden).
   */
  onDone?: () => void;
  /**
   * Duration in ms before auto-calling onDone. Defaults to 2000.
   */
  timeoutMs?: number;
}

export function ChessStartAnimation({ onDone, timeoutMs = 2000 }: ChessStartAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let anim: AnimationItem | null = null;
    const container = containerRef.current;

    if (container) {
      anim = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: false,
        autoplay: true,
        animationData: chessStartAnimation as unknown as object,
      });
    }

    let timeoutId: number | null = null;
    if (onDone) {
      timeoutId = window.setTimeout(() => {
        onDone();
      }, timeoutMs);
    }

    return () => {
      if (anim) {
        anim.destroy();
      }
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [onDone, timeoutMs]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
      {/* Centered card with animation */}
      <div className="pointer-events-auto relative flex max-w-xs flex-col items-center justify-center rounded-3xl bg-black/80 px-6 py-6 text-center shadow-2xl ring-1 ring-white/10">
        <div
          ref={containerRef}
          className="h-40 w-40 max-w-full lottie-white"
          aria-label="Chess game starting animation"
        />
        <p className="mt-3 text-sm font-semibold text-sand">Let the game begin!</p>
        <p className="mt-1 text-xs text-foreground/70">Get ready… pieces will unlock in a moment.</p>
      </div>
    </div>
  );
}
