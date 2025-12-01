"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { games } from "@/lib/games";
import ChessBoard from "@/components/ChessBoard";
import TicTacToeBoard from "@/components/TicTacToeBoard";
import ConnectFourBoard from "@/components/ConnectFourBoard";
import { ChessStartAnimation } from "@/components/ChessStartAnimation";

export default function PlayGamePreviewPage() {
  const params = useParams();
  const gameKey = (params.game as string) || "";
  const [showStartAnim, setShowStartAnim] = useState(gameKey === "chess");

  const game = useMemo(() => games.find((g) => g.key === gameKey), [gameKey]);

  if (!game) {
    return (
      <div className="min-h-screen bg-animated-gradient p-6">
        <div className="mx-auto mt-20 max-w-md text-center text-sm text-foreground/80">
          <p>Unknown game key: {gameKey}</p>
          <a
            href="/games"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-black/40 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur hover:bg-black/60"
          >
            ← Back to games
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-animated-gradient p-6">
      {gameKey === "chess" && showStartAnim && (
        <ChessStartAnimation onDone={() => setShowStartAnim(false)} timeoutMs={2000} />
      )}
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/40 px-5 py-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black/60 text-2xl">
              {game.icon}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground/60">
                Preview mode
              </p>
              <h1 className="text-lg font-semibold text-foreground">{game.title} board</h1>
            </div>
          </div>
          <a
            href="/games"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/25 bg-black/40 px-4 py-1.5 text-xs font-semibold text-foreground/90 transition hover:bg-black/60"
          >
            <span className="text-sm">←</span>
            Back to games
          </a>
        </div>

        {/* Info row */}
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-4 text-xs text-foreground/75">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/60">
              About this game
            </p>
            <p className="mt-1 text-sm text-foreground/85">{game.desc}</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px] text-foreground/70">
            <span>👥 {game.players}</span>
            <span>⏱ {game.time}</span>
            <span className="mt-1 rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
              No room • Just a preview
            </span>
          </div>
        </div>

        {/* Board preview */}
        <div className="glass-card flex flex-col rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between text-xs text-foreground/70">
            <span>Board preview</span>
            <span className="inline-flex items-center rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Playable demo (local)
            </span>
          </div>
          {gameKey === "tictactoe" ? (
            <TicTacToeBoard />
          ) : gameKey === "connect4" ? (
            <ConnectFourBoard />
          ) : (
            <ChessBoard />
          )}
        </div>
      </div>
    </div>
  );
}
