"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

interface RoomPlayer {
  id: string;
  username: string;
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = (params.code as string)?.toUpperCase() || "";
  const initialUsername = (searchParams.get("username") || "").trim();
  const gameKey = (searchParams.get("game") || "ludo").trim();
  const playersParam = (searchParams.get("players") || "").trim();
  const defaultPlayerCount: 2 | 4 = playersParam === "4" ? 4 : 2;
  const { socket, connected } = useSocket();

  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [systemMsg, setSystemMsg] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!socket || !connected || !roomCode) return;

    // Host or guest joins the room here; we attach the username from the previous step.
    socket.emit("join_room", roomCode, initialUsername);

    socket.on("room_players", (list: RoomPlayer[]) => {
      setPlayers(list);
    });

    socket.on("system", (msg: string) => {
      setSystemMsg(msg);
      setTimeout(() => setSystemMsg(""), 3000);
    });

    socket.on("game_started", (config?: { players?: number; game?: string }) => {
      setStarting(false);
      const effectiveGameKey = (config?.game as string) || gameKey;
      const playersFromConfig =
        effectiveGameKey === "ludo" && config?.players === 4 ? 4 : 2;
      const usernameParam = encodeURIComponent(initialUsername);
      const gameParam = encodeURIComponent(effectiveGameKey);
      const playersQuery =
        effectiveGameKey === "ludo"
          ? `&players=${encodeURIComponent(String(playersFromConfig))}`
          : "";
      router.push(
        `/room/${roomCode}?username=${usernameParam}&game=${gameParam}${playersQuery}`,
      );
    });

    return () => {
      socket.off("room_players");
      socket.off("system");
      socket.off("game_started");
    };
  }, [socket, connected, roomCode, router, initialUsername, gameKey]);

  const handleStartGame = () => {
    if (!socket || !roomCode) return;
    setStarting(true);
    const payload =
      gameKey === "ludo"
        ? { players: defaultPlayerCount, game: gameKey }
        : { game: gameKey };
    socket.emit("start_game", roomCode, payload);
  };

  return (
    <div className="min-h-screen bg-animated-gradient p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <button
          onClick={() => router.push("/games")}
          className="flex items-center gap-2 text-xs font-medium text-foreground/80 transition hover:text-foreground"
        >
          <span className="text-base">←</span>
          Exit lobby
        </button>

        <div className="glass-card rounded-3xl px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
            Step 3 of 3
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Waiting for friends to join.
          </h1>
          <p className="mt-1 text-sm text-foreground/75">
            Share this code with your friends. When everyone is here, start the game
            for all of you at once.
          </p>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-black/40 px-4 py-3">
            <div>
              <p className="text-xs font-medium text-foreground/60">Room code</p>
              <p className="font-mono text-xl font-semibold tracking-[0.35em] text-yellow">
                {roomCode}
              </p>
            </div>
            <div className="text-right text-xs text-foreground/60">
              <p>{connected ? "🟢 Connected" : "🔴 Offline"}</p>
              <p>{players.length} in room</p>
            </div>
          </div>

          {systemMsg && (
            <div className="mt-3 rounded-2xl border border-cyan/40 bg-cyan/15 px-3 py-2 text-xs text-cyan">
              {systemMsg}
            </div>
          )}

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
              Players here now
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {players.length === 0 && (
                <li className="rounded-2xl bg-black/40 px-3 py-2 text-xs text-foreground/60">
                  Waiting for the first friend to join…
                </li>
              )}
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl bg-black/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky/20 text-xs">
                      👤
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {p.username || "Friend"}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                    Ready
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleStartGame}
            disabled={!connected || players.length === 0 || starting}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-orange to-yellow px-4 py-2.5 text-sm font-semibold text-navy shadow-lg shadow-orange/40 transition hover:scale-[1.02] disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start game for everyone"}
          </button>
        </div>
      </div>
    </div>
  );
}
