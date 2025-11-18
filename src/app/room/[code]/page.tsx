"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import ChessBoard from "@/components/ChessBoard";
import { ChessStartAnimation } from "@/components/ChessStartAnimation";

interface ChatMessage {
  from: string;
  msg: string;
}

interface RoomPlayerInfo {
  id: string;
  username: string;
  color: "w" | "b" | null;
}

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = (params.code as string)?.toUpperCase() || "";
  const fromQuery = (searchParams.get("username") || "").trim();
  const { socket, connected } = useSocket();

  const [username] = useState(
    () => fromQuery || "Player" + Math.floor(Math.random() * 1000),
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [systemMsg, setSystemMsg] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);

  useEffect(() => {
    if (!socket || !connected || !roomCode) return;

    socket.emit("join_room", roomCode, username);

    socket.on("chess_role", ({ color }: { color: "w" | "b" | null }) => {
      setPlayerColor(color ?? null);
    });

    // Ludo roles are no longer used since Ludo game was removed.

    socket.on("system", (msg: string) => {
      setSystemMsg(msg);
      setTimeout(() => setSystemMsg(""), 3000);
    });

    socket.on("chat", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("game_started", () => {
      // Show a short start animation + confetti when the game begins.
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2000);
    });

    socket.on("room_players", (_players: RoomPlayerInfo[]) => {
      // Room players list is currently not rendered here; we keep listening so
      // the server can still broadcast without causing errors.
    });

    return () => {
      socket.off("chess_role");
      // Ludo roles listener removed.
      socket.off("system");
      socket.off("chat");
      socket.off("game_started");
      socket.off("room_players");
    };
  }, [socket, connected, roomCode, username]);

  const sendChat = () => {
    if (!socket || !chatInput.trim()) return;
    socket.emit("chat", roomCode, chatInput);
    setChatInput("");
  };

  // Ludo role selection has been removed along with the Ludo game.

  return (
    <div className="min-h-screen bg-animated-gradient p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/40 px-5 py-3 shadow-lg backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground/60">
              Private room
            </p>
            <h1 className="mt-1 text-lg font-semibold text-foreground">
              Code:
              <span className="ml-2 rounded-md bg-black/60 px-2.5 py-1 font-mono text-sm tracking-[0.25em] text-cyan">
                {roomCode}
              </span>
            </h1>
            <p className="mt-1 text-xs text-foreground/70">
              {connected ? "You are connected. Chat and moves will be instant." : "Not connected. Check your internet and try refreshing."}
            </p>
          </div>
          <a
            href="/games"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/25 bg-black/40 px-4 py-1.5 text-xs font-semibold text-foreground/90 transition hover:bg-black/60"
          >
            <span className="text-sm">←</span>
            Exit room
          </a>
        </div>

        {celebrate && (
          <ChessStartAnimation onDone={() => setCelebrate(false)} timeoutMs={2000} />
        )}

        {systemMsg && (
          <div className="rounded-2xl border border-cyan/40 bg-cyan/15 px-4 py-2 text-center text-xs font-medium text-cyan">
            {systemMsg}
          </div>
        )}

        {/* Game + Chat layout */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.75fr)]">
          {/* Game canvas area */}
          <div className="glass-card flex flex-col rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between text-xs text-foreground/70">
              <span>
                Shared game board
                <span className="ml-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-foreground/60">
                  Chess
                </span>
              </span>
              <span className="inline-flex items-center rounded-full bg-black/40 px-2.5 py-1 font-mono text-[11px]">
                {username}
              </span>
            </div>

            {playerColor === null ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-orange/40 bg-orange/10 px-6 py-10 text-center">
                <p className="text-sm font-semibold text-orange">
                  This room is full (2 players max)
                </p>
                <p className="mt-2 text-xs text-foreground/70">
                  Chess requires exactly two players. You joined as a spectator, but
                  this game does not support spectators. Please create a new room or
                  join a different one.
                </p>
                <a
                  href="/games"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-black/40 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-black/60"
                >
                  ← Back to games
                </a>
              </div>
            ) : (
              <ChessBoard socket={socket} roomCode={roomCode} playerColor={playerColor} />
            )}
          </div>

          {/* Chat panel */}
          <div className="glass-card flex max-h-[520px] flex-col rounded-3xl">
            <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
              <h2 className="text-sm font-semibold text-sand">Room chat</h2>
              <span className="text-[11px] text-foreground/60">Be kind. Everyone sees this.</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.length === 0 && (
                <p className="text-center text-xs text-foreground/50">
                  No messages yet. Say hi to your friends!
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className="rounded-2xl bg-teal/20 px-3 py-2">
                  <p className="text-[11px] font-semibold text-orange">{m.from}</p>
                  <p className="mt-0.5 text-xs text-foreground">{m.msg}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-foreground/10 p-3">
              <input
                className="flex-1 rounded-xl border border-foreground/20 bg-black/40 px-3 py-2 text-xs text-foreground outline-none placeholder:text-foreground/40 focus:border-cyan"
                placeholder="Type a message…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button
                className="rounded-xl bg-cyan px-4 py-2 text-xs font-semibold text-background shadow-md transition hover:scale-105"
                onClick={sendChat}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
