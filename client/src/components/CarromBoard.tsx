"use client";

export default function CarromBoard() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-md items-center justify-between text-xs text-foreground/70">
        <span>Carrom board</span>
        <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          Coming soon
        </span>
      </div>
      <div className="relative mx-auto w-full max-w-md rounded-3xl border border-foreground/20 bg-black/60 p-3 shadow-inner">
        <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-black/80">
          <img
            src="/carrom-board.jpg"
            alt="Carrom board"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
