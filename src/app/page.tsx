import { games } from "@/lib/games";

export default function Home() {
  const topGames = games;

  return (
    <div className="min-h-screen bg-animated-gradient">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/40 text-2xl shadow-lg">
            🎮
          </span>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-sky/80">
              Play with friends
            </span>
            <span className="text-xl font-semibold text-foreground">Fun, together.</span>
          </div>
        </div>
        <a
          href="/games"
          className="hidden rounded-full border border-sky/40 bg-black/30 px-5 py-2 text-sm font-semibold text-sky shadow-md backdrop-blur hover:bg-sky/15 sm:inline-flex"
        >
          Browse games
        </a>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-4 md:flex-row md:items-stretch md:gap-10">
        {/* Left: copy + CTA */}
        <section className="flex max-w-xl flex-1 flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-6 flex gap-3 text-4xl md:text-5xl">
            <span className="animate-bounce" style={{ animationDelay: "0s" }}>
              🎲
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.12s" }}>
              ♟️
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.24s" }}>
              🎯
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            Play simple party games
            <br />
            <span className="bg-gradient-to-r from-yellow to-orange bg-clip-text text-transparent">
              with people you love.
            </span>
          </h1>

          <p className="mb-7 max-w-lg text-base text-foreground/80 md:text-lg">
            No logins, no downloads, no confusion. Choose a game, share a short
            room code, and you are all in the same place within seconds.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <a
              href="/games"
              className="animate-pulse-slow group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange to-yellow px-9 py-3.5 text-base font-semibold text-navy shadow-2xl shadow-orange/40 transition-transform hover:scale-105"
            >
              <span className="mr-2 text-xl">🎮</span>
              Start playing now
            </a>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-foreground/60">
              Free • In browser • Up to 4 friends
            </p>
          </div>
        </section>

        {/* Right: compact steps card + game list */}
        <section className="mt-10 w-full max-w-md flex-1 space-y-4 md:mt-0">
          <div className="glass-card rounded-3xl px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
              How it works
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Three tiny steps. Zero friction.
            </h2>

            <ol className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky/15 text-xs font-semibold text-sky">
                  1
                </div>
                <div>
                  <p className="font-semibold text-foreground">Pick a game</p>
                  <p className="text-foreground/70">
                    Browse a tiny, curated list of games that are easy to explain to
                    anyone.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-cyan/15 text-xs font-semibold text-cyan">
                  2
                </div>
                <div>
                  <p className="font-semibold text-foreground">Create a room</p>
                  <p className="text-foreground/70">
                    We generate a private 6-letter code. Share it with your friends.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-orange/15 text-xs font-semibold text-orange">
                  3
                </div>
                <div>
                  <p className="font-semibold text-foreground">Play and chat</p>
                  <p className="text-foreground/70">
                    Everyone sees the same board and can talk in real-time chat.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Featured games preview */}
          <div className="glass-card rounded-3xl px-6 py-5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
                  Games inside
                </p>
                <h3 className="mt-1 text-sm font-semibold text-foreground">
                  Tiny library, big fun.
                </h3>
              </div>
              <a
                href="/games"
                className="text-xs font-semibold text-sky underline-offset-4 hover:underline"
              >
                View all
              </a>
            </div>

            <ul className="mt-4 space-y-3 text-sm">
              {topGames.map((game) => (
                <li
                  key={game.key}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-black/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black/40 text-xl">
                      {game.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {game.title}
                      </p>
                      <p className="text-[11px] text-foreground/60">{game.players}</p>
                    </div>
                  </div>
                  <a
                    href={`/rooms?game=${game.key}`}
                    className="text-[11px] font-semibold text-foreground/70 underline-offset-2 hover:underline"
                  >
                    Play
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
