"use client";

export default function CarromBoard() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-md items-center justify-between text-xs text-foreground/70">
        <span>Carrom board</span>
        <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          Visual preview
        </span>
      </div>
      <div className="relative mx-auto w-full max-w-md rounded-3xl border border-foreground/20 bg-black/60 p-3 shadow-inner">
        <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-black/80">
          <img
            src="/carrom-board.jpg"
            alt="Carrom board"
            className="h-full w-full object-cover"
          />
          {/* Coins overlay (static preview for now) */}
          <div className="pointer-events-none absolute inset-0">
            {/* Main coin in the center */}
            <img
              src="/carrom-coin-main.png"
              alt="Main coin"
              className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_12px_rgba(248,250,252,0.9)]"
            />
            {/* A few black and white coins near center to suggest layout */}
            <img
              src="/carrom-coin-white.png"
              alt="White coin"
              className="absolute left-[48%] top-[42%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_rgba(148,163,184,0.9)]"
            />
            <img
              src="/carrom-coin-black.png"
              alt="Black coin"
              className="absolute left-[55%] top-[46%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_rgba(15,23,42,0.9)]"
            />
            <img
              src="/carrom-coin-white.png"
              alt="White coin"
              className="absolute left-[45%] top-[54%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_rgba(148,163,184,0.9)]"
            />
            <img
              src="/carrom-coin-black.png"
              alt="Black coin"
              className="absolute left-[52%] top-[58%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_rgba(15,23,42,0.9)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
