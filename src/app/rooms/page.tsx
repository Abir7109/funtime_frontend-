"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function RoomsContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const presetGame = sp.get("game") || "";
  const presetMode = sp.get("mode") || "";

  const [username, setUsername] = useState("");
  const [game, setGame] = useState(presetGame);
  const [joinCode, setJoinCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "join">(
    (presetMode as "create" | "join") || "create",
  );

  const canCreate = username.trim() !== "";
  const canJoin = username.trim() !== "" && joinCode.trim().length === 6;

  const handleCreate = () => {
    const code = generateCode();
    setCreatedCode(code);
    const usernameParam = encodeURIComponent(username.trim());
    const gameParam = encodeURIComponent("chess");
    setTimeout(
      () =>
        router.push(
          `/lobby/${code}?username=${usernameParam}&game=${gameParam}`,
        ),
      1400,
    );
  };

  const handleJoin = () => {
    const usernameParam = encodeURIComponent(username.trim());
    const gameParam = encodeURIComponent("chess");
    router.push(`/lobby/${joinCode}?username=${usernameParam}&game=${gameParam}`);
  };

  return (
    <div className="min-h-screen bg-animated-gradient px-6 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <button
          onClick={() => router.push("/games")}
          className="flex items-center gap-2 text-xs font-medium text-foreground/80 transition hover:text-foreground"
        >
          <span className="text-base">←</span>
          Back to games
        </button>

        <div className="glass-card rounded-3xl px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
            Step 2 of 3
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Create a room or join one.
          </h1>
          <p className="mt-1 text-sm text-foreground/75">
            Use a short code to keep your game private. Share it only with the people
            you trust.
          </p>

          {/* Shared username field */}
          <div className="mt-5">
            <label className="mb-1 block text-xs font-medium text-foreground/70">
              Your nickname
            </label>
            <input
              className="w-full rounded-lg border border-foreground/20 bg-black/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:border-cyan"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="What should friends see?"
            />
          </div>

          {/* Tabs */}
          <div className="mt-6 rounded-full bg-black/40 p-1 text-xs font-semibold text-foreground/70">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`rounded-full px-3 py-2 transition ${
                  activeTab === "create"
                    ? "bg-foreground text-background"
                    : "hover:bg-black/40"
                }`}
              >
                Create room
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("join")}
                className={`rounded-full px-3 py-2 transition ${
                  activeTab === "join"
                    ? "bg-foreground text-background"
                    : "hover:bg-black/40"
                }`}
              >
                Join with code
              </button>
            </div>
          </div>

          {activeTab === "create" ? (
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  Game
                </label>
                <input
                  className="w-full rounded-lg border border-foreground/20 bg-black/30 px-3 py-2 text-sm text-foreground outline-none focus:border-cyan"
                  value="Chess"
                  disabled
                />
              </div>

              <button
                className="mt-1 w-full rounded-full bg-gradient-to-r from-orange to-yellow px-4 py-2.5 text-sm font-semibold text-navy shadow-lg shadow-orange/40 transition hover:scale-[1.02] disabled:opacity-60"
                disabled={!canCreate}
                onClick={handleCreate}
              >
                Generate private room
              </button>

              {createdCode && (
                <div className="mt-3 rounded-xl border border-yellow/40 bg-black/40 p-3 text-center text-sm">
                  <p className="text-xs font-medium text-foreground/70">
                    Share this code with friends:
                  </p>
                  <p className="mt-1 font-mono text-xl font-semibold tracking-[0.35em] text-yellow">
                    {createdCode}
                  </p>
                  <p className="mt-1 text-[11px] text-foreground/60">
                    We will open the room automatically.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/70">
                  Room code
                </label>
                <input
                  className="w-full rounded-lg border border-foreground/20 bg-black/30 px-3 py-2 font-mono text-sm uppercase tracking-[0.35em] text-foreground outline-none placeholder:text-foreground/35 focus:border-cyan"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>

              <button
                className="w-full rounded-full border border-cyan px-4 py-2.5 text-sm font-semibold text-cyan transition hover:bg-cyan hover:text-background disabled:opacity-60"
                disabled={!canJoin}
                onClick={handleJoin}
              >
                Join room
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-animated-gradient" />}>
      <RoomsContent />
    </Suspense>
  );
}
