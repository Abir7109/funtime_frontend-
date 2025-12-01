"use client";

import { useRouter } from "next/navigation";
import { games } from "@/lib/games";

export default function GamesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-animated-gradient px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-foreground/80 transition hover:text-foreground"
        >
          <span className="text-lg">←</span>
          Back to home
        </button>

        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Pick a game</h1>
            <p className="mt-1 text-sm text-foreground/75 md:text-base">
              Just two games for now. Both are simple to learn and perfect for quick sessions.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
            Step 1 of 3
          </p>
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          {games.map((game) => (
            <button
              key={game.key}
              onClick={() => router.push(`/rooms?game=${game.key}`)}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-black/40 p-5 text-left shadow-xl ring-1 ring-white/5 transition-transform hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Thumbnail */}
              <div className="mb-4 overflow-hidden rounded-2xl">
                <div
                  className={`relative flex h-40 items-center justify-between bg-gradient-to-br ${game.accent}`}
                >
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <span className="inline-flex w-fit items-center rounded-full bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
                      {game.badge}
                    </span>
                    <p className="mt-3 max-w-[11rem] text-xs text-white/90">
                      {game.thumbnailLine}
                    </p>
                  </div>
                  <div className="relative flex h-full flex-1 items-center justify-center">
                    <div className="h-24 w-24 rounded-3xl bg-black/20 shadow-[0_18px_40px_rgba(15,23,42,0.4)] backdrop-blur-sm">
                      <div className="flex h-full w-full items-center justify-center text-5xl">
                        {game.icon}
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35)_0,_transparent_45%)]" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <h2 className="mb-1 text-2xl font-semibold text-foreground">{game.title}</h2>
              <p className="mb-4 text-sm text-foreground/80">{game.desc}</p>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/65">
                <span>👥 {game.players}</span>
                <span>⏱ {game.time}</span>
                <span className="ml-auto inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-foreground/80">
                  Play with friends →
                </span>
              </div>

              <div className="mt-3 flex items-center justify-end text-[11px] text-foreground/60">
                <a
                  href={`/play/${game.key}`}
                  className="underline-offset-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Preview board (no room)
                </a>
              </div>
            </button>
          ))}
        </div>

        {/* Or join existing room */}
        <div className="mt-12 text-center">
          <p className="mb-3 text-sm text-foreground/70">Already have a room code?</p>
          <button
            onClick={() => router.push("/rooms?mode=join")}
            className="rounded-full border border-foreground/20 bg-black/30 px-8 py-3 text-sm font-semibold text-foreground shadow-lg backdrop-blur hover:bg-black/45"
          >
            Join with code →
          </button>
        </div>
      </div>
    </div>
  );
}
