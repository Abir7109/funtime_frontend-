"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
type PlayerId = number;

const TOKENS_PER_PLAYER = 4;
const TRACK_LENGTH = 28; // simplified loop length for demo
// Star safe squares on the loop (shared safe squares around the loop)
const STAR_POSITIONS: number[] = [2, 6, 10, 14, 16, 20, 24, 26];

// Approximate positions (in %) for tokens along the outer track of the board
// Indexed by board position 0..TRACK_LENGTH-1.
const TRACK_POSITIONS: { top: number; left: number }[] = [
  // Top edge (right to left)
  { top: 8, left: 80 },
  { top: 8, left: 72 },
  { top: 8, left: 64 },
  { top: 8, left: 56 },
  { top: 8, left: 48 },
  { top: 8, left: 40 },
  { top: 8, left: 32 },
  // Left edge (top to bottom)
  { top: 16, left: 8 },
  { top: 24, left: 8 },
  { top: 32, left: 8 },
  { top: 40, left: 8 },
  { top: 48, left: 8 },
  { top: 56, left: 8 },
  { top: 64, left: 8 },
  // Bottom edge (left to right)
  { top: 92, left: 32 },
  { top: 92, left: 40 },
  { top: 92, left: 48 },
  { top: 92, left: 56 },
  { top: 92, left: 64 },
  { top: 92, left: 72 },
  { top: 92, left: 80 },
  // Right edge (bottom to top)
  { top: 64, left: 92 },
  { top: 56, left: 92 },
  { top: 48, left: 92 },
  { top: 40, left: 92 },
  { top: 32, left: 92 },
  { top: 24, left: 92 },
  { top: 16, left: 92 },
];

// Home token positions per player (0: Red, 1: Green, 2: Yellow, 3: Blue)
// Each inner array has 4 positions, one for each token index 0..3.
const HOME_POSITIONS: { top: number; left: number }[][] = [
  // Red (top-right quadrant) – centers of the 4 small red squares inside the white box
  [
    { top: 25, left: 68 },
    { top: 25, left: 78 },
    { top: 35, left: 68 },
    { top: 35, left: 78 },
  ],
  // Green (bottom-right quadrant)
  [
    { top: 65, left: 68 },
    { top: 65, left: 78 },
    { top: 75, left: 68 },
    { top: 75, left: 78 },
  ],
  // Yellow (bottom-left quadrant)
  [
    { top: 65, left: 22 },
    { top: 65, left: 32 },
    { top: 75, left: 22 },
    { top: 75, left: 32 },
  ],
  // Blue (top-left quadrant)
  [
    { top: 25, left: 22 },
    { top: 25, left: 32 },
    { top: 35, left: 22 },
    { top: 35, left: 32 },
  ],
];

interface Token {
  state: "home" | "track" | "done";
  steps: number; // how many steps taken from this player's start
  pos: number; // board index 0..TRACK_LENGTH-1, if on track
}

interface PlayerState {
  id: PlayerId;
  name: string;
  color: string;
  startIndex: number;
  tokens: Token[];
}

interface TrackOccupant {
  playerId: PlayerId;
  tokenIndex: number;
}

interface LudoSnapshot {
  players: PlayerState[];
  currentPlayer: PlayerId;
  dice: number | null;
  phase: "idle" | "rolled";
  winner: PlayerId | null;
  rolledFlags: boolean[];
}

interface LudoBoardProps {
  playerCount?: 2 | 4;
  socket?: Socket | null;
  roomCode?: string;
  playerIndex?: PlayerId | null;
}

function createInitialPlayers(playerCount: 2 | 4): PlayerState[] {
  const base: { name: string; color: string }[] = [
    { name: "Red", color: "#ff0000" },
    { name: "Green", color: "#009900" },
    { name: "Yellow", color: "#ffcc00" },
    { name: "Blue", color: "#66ccff" },
  ];

  const players: PlayerState[] = [];
  for (let i = 0; i < playerCount; i++) {
    const startIndex = Math.floor((TRACK_LENGTH * i) / playerCount);
    players.push({
      id: i,
      name: `${base[i].name} Player`,
      color: base[i].color,
      startIndex,
      tokens: Array(TOKENS_PER_PLAYER)
        .fill(null)
        .map(() => ({ state: "home", steps: 0, pos: -1 })),
    });
  }
  return players;
}

function computePos(startIndex: number, steps: number): number {
  return (startIndex + steps) % TRACK_LENGTH;
}

function canMoveToken(player: PlayerState, token: Token, dice: number): boolean {
  if (dice <= 0) return false;
  if (token.state === "done") return false;

  if (token.state === "home") {
    // Need a 6 to leave home
    return dice === 6;
  }

  // On track
  const newSteps = token.steps + dice;
  if (newSteps > TRACK_LENGTH) return false; // can't overshoot home
  return true;
}

export default function LudoBoard({ playerCount = 2, socket, roomCode, playerIndex }: LudoBoardProps) {
  const [players, setPlayers] = useState<PlayerState[]>(() => createInitialPlayers(playerCount));
  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(0);
  const [dice, setDice] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "rolled">("idle");
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<number | null>(null);
  const [rolledFlags, setRolledFlags] = useState<boolean[]>(() =>
    Array(playerCount).fill(false),
  );

  const isNetworked = Boolean(socket && roomCode);
  const isParticipant = playerIndex != null;
  const applyingRemoteRef = useRef(false);

  const current = useMemo(
    () => players[currentPlayer]!,
    [players, currentPlayer],
  );

  const isMyTurn = isParticipant && playerIndex === currentPlayer;

  const handleRoll = () => {
    if (phase === "rolled" || winner !== null || isRolling) return;
    if (!isMyTurn) return;

    const target = Math.floor(Math.random() * 6) + 1;
    setIsRolling(true);

    const durationMs = 900;
    const intervalMs = 80;
    let elapsed = 0;

    const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
      elapsed += intervalMs;
      if (elapsed >= durationMs) {
        clearInterval(intervalId);
        setIsRolling(false);
        setDice(target);
        setDisplayDice(target);
        setPhase("rolled");
        setRolledFlags((prev) => {
          const base =
            prev.length === players.length
              ? [...prev]
              : Array(players.length).fill(false);
          if (currentPlayer >= 0 && currentPlayer < base.length) {
            base[currentPlayer] = true;
          }
          return base;
        });
      } else {
        const rollingValue = Math.floor(Math.random() * 6) + 1;
        setDisplayDice(rollingValue);
      }
    }, intervalMs);
  };
  const endTurn = useCallback(
    (lastRoll: number) => {
      if (winner !== null) return;
      // Extra turn on 6
      if (lastRoll === 6) {
        setPhase("idle");
        setDice(null);
        return;
      }
      setCurrentPlayer((prev) => (prev + 1) % players.length);
      setPhase("idle");
      setDice(null);
    },
    [winner, players.length],
  );

  const handleTokenClick = (tokenIndex: number) => {
    if (phase !== "rolled" || dice == null || winner !== null) return;
    if (!isMyTurn) return;
    const d = dice;

    setPlayers((prev) => {
      const next = prev.map((p) => ({ ...p, tokens: p.tokens.map((t) => ({ ...t })) }));
      const me = next.find((p) => p.id === currentPlayer)!;
      const token = me.tokens[tokenIndex];

      if (!canMoveToken(me, token, d)) {
        return prev; // no change
      }

      if (token.state === "home" && d === 6) {
        token.state = "track";
        token.steps = 0;
        token.pos = computePos(me.startIndex, token.steps);
      } else if (token.state === "track") {
        const newSteps = token.steps + d;
        if (newSteps === TRACK_LENGTH) {
          token.state = "done";
          token.steps = newSteps;
          token.pos = -1;
        } else if (newSteps < TRACK_LENGTH) {
          token.steps = newSteps;
          token.pos = computePos(me.startIndex, token.steps);
        } else {
          return prev; // overshoot, shouldn't happen due to canMoveToken
        }
      }

      // Handle capture on new position (not allowed on star/safe squares)
      if (token.state === "track" && !STAR_POSITIONS.includes(token.pos)) {
        for (const p of next) {
          if (p.id === me.id) continue;
          for (const other of p.tokens) {
            if (other.state === "track" && other.pos === token.pos) {
              // Send captured token home
              other.state = "home";
              other.steps = 0;
              other.pos = -1;
            }
          }
        }
      }

      // Check winner
      if (me.tokens.every((t) => t.state === "done")) {
        setWinner(me.id);
      }

      // Turn handling
      endTurn(d);

      return next;
    });
  };

  const trackOccupants = useMemo(() => {
    const map = new Map<number, TrackOccupant[]>();
    for (const p of players) {
      p.tokens.forEach((t, tokenIndex) => {
        if (t.state === "track") {
          const list = map.get(t.pos) ?? [];
          list.push({ playerId: p.id, tokenIndex });
          map.set(t.pos, list);
        }
      });
    }
    return map;
  }, [players]);

  const currentCanMove = useMemo(() => {
    if (dice == null) return false;
    const me = current;
    return me.tokens.some((t) => canMoveToken(me, t, dice));
  }, [current, dice]);

  const resetGame = () => {
    setPlayers(createInitialPlayers(playerCount));
    setCurrentPlayer(0);
    setDice(null);
    setDisplayDice(null);
    setPhase("idle");
    setWinner(null);
    setIsRolling(false);
  };

  // If you roll the dice but have no valid move, automatically pass the turn
  // so the game never gets stuck waiting for a manual refresh.
  useEffect(() => {
    if (winner !== null) return;
    if (phase !== "rolled" || dice == null) return;
    if (currentCanMove) return;
    endTurn(dice);
  }, [winner, phase, dice, currentCanMove, endTurn]);

  // When every player has rolled at least once in the current cycle,
  // automatically reset their "rolled" flags so the UI shows
  // "Not rolled" again for the next round.
  useEffect(() => {
    if (players.length === 0) return;
    if (rolledFlags.length !== players.length) return;
    if (rolledFlags.every(Boolean)) {
      setRolledFlags(Array(players.length).fill(false));
    }
  }, [rolledFlags, players.length]);

  // Broadcast local Ludo state to the room when it changes. We treat the
  // client as authoritative and the server as a relay. To avoid echo loops,
  // we skip broadcasts when we're applying a remote snapshot.
  useEffect(() => {
    if (!isNetworked || !isParticipant || !socket || !roomCode) return;
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }
    const snapshot: LudoSnapshot = {
      players,
      currentPlayer,
      dice,
      phase,
      winner,
      rolledFlags,
    };
    socket.emit("ludo_state", roomCode, snapshot);
  }, [
    players,
    currentPlayer,
    dice,
    phase,
    winner,
    rolledFlags,
    isNetworked,
    isParticipant,
    socket,
    roomCode,
  ]);

  // Listen for remote Ludo state updates from other players in the room.
  useEffect(() => {
    if (!socket || !roomCode) return;

    const handleState = (state: LudoSnapshot) => {
      applyingRemoteRef.current = true;
      setPlayers(state.players);
      setCurrentPlayer(state.currentPlayer);
      setDice(state.dice);
      setDisplayDice(state.dice);
      setPhase(state.phase);
      setWinner(state.winner);
      setRolledFlags(
        state.rolledFlags && state.rolledFlags.length === state.players.length
          ? state.rolledFlags
          : Array(state.players.length).fill(false),
      );
      setIsRolling(false);
    };

    socket.on("ludo_state", handleState);
    return () => {
      socket.off("ludo_state", handleState);
    };
  }, [socket, roomCode]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-foreground/70">
        <span>Ludo board</span>
        <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          {winner !== null
            ? `Winner: ${players.find((p) => p.id === winner)?.name}`
            : `Turn: ${current.name}`}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/70">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-foreground/30"
            style={{ backgroundColor: current.color }}
          />
          <span>{current.name}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex flex-wrap justify-end gap-1 text-[10px] text-foreground/60">
            {players.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.name}</span>
                <span className="font-mono">
                  {rolledFlags[p.id] ? "Rolled" : "Not rolled"}
                </span>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleRoll}
            disabled={
              phase === "rolled" ||
              winner !== null ||
              isRolling ||
              !isMyTurn
            }
            className="rounded-full bg-gradient-to-r from-orange to-yellow px-4 py-1.5 text-[11px] font-semibold text-navy shadow-md shadow-orange/40 disabled:opacity-60"
          >
            {isRolling ? "Rolling..." : phase === "idle" ? "Roll dice" : "Rolled"}
          </button>
        </div>
      </div>

      {!currentCanMove && phase === "rolled" && winner === null && (
        <p className="text-[11px] text-foreground/60">
          No valid moves with this roll. Click <strong>Roll dice</strong> again to pass turn.
        </p>
      )}

      {/* Ludo board visual based on provided HTML/CSS design */}
      <div className="glass-card flex flex-col items-center gap-3 rounded-3xl p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          Board
        </div>
        <div className="relative ludo-root">
          {/* Use an image-based board similar to the preview design and overlay our tokens on top */}
          <div className="ludo">
            {/* Token overlay: shows pieces in homes and along the track */}
            <div className="pointer-events-none absolute inset-0">
              {/* Dice in red home box (uses the first red home square as position) */}
              <div
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ top: `${HOME_POSITIONS[0][0].top}%`, left: `${HOME_POSITIONS[0][0].left}%` }}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-[11px] font-bold text-yellow ${isRolling ? "animate-spin" : ""}`}
                >
                  {displayDice ?? dice ?? "-"}
                </div>
              </div>

              {/* Track tokens */}
              {Array.from(trackOccupants.entries()).map(([pos, occ]) => {
                const coord = TRACK_POSITIONS[pos];
                if (!coord) return null;

                return (
                  <div
                    key={pos}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                    style={{ top: `${coord.top}%`, left: `${coord.left}%` }}
                  >
                    <div className="flex gap-0.5">
                      {occ.map(({ playerId, tokenIndex }) => {
                        const p = players[playerId];
                        if (!p) return null;
                        const isCurrent = playerId === currentPlayer;
                        const disabled =
                          phase !== "rolled" ||
                          dice == null ||
                          winner !== null ||
                          !isCurrent ||
                          isRolling ||
                          !isMyTurn;

                        return (
                          <button
                            key={tokenIndex}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              if (!disabled) handleTokenClick(tokenIndex);
                            }}
                            className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full border border-black/60 bg-white/90 text-[9px] font-bold shadow-sm"
                            style={{
                              backgroundColor: p.color,
                              opacity: isCurrent ? 1 : 0.6,
                            }}
                          >
                            {tokenIndex + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Home tokens */}
              {players.map((p) =>
                p.tokens.map((t, tokenIndex) => {
                  if (t.state !== "home") return null;
                  const homeCoords = HOME_POSITIONS[p.id]?.[tokenIndex];
                  if (!homeCoords) return null;
                  const isCurrent = p.id === currentPlayer;
                  const disabled =
                    phase !== "rolled" ||
                    dice == null ||
                    winner !== null ||
                    !isCurrent ||
                    isRolling ||
                    !isMyTurn;

                  return (
                    <button
                      key={`${p.id}-${tokenIndex}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (!disabled) handleTokenClick(tokenIndex);
                      }}
                      className="pointer-events-auto absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/60 bg-white/90 text-[9px] font-bold shadow-sm"
                      style={{
                        top: `${homeCoords.top}%`,
                        left: `${homeCoords.left}%`,
                        backgroundColor: p.color,
                        opacity: isCurrent ? 1 : 0.9,
                      }}
                    >
                      {tokenIndex + 1}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <div className="ludoCenter">♛</div>
        </div>
      </div>

      <div className="glass-card mt-2 flex flex-col gap-3 rounded-3xl p-4 text-[11px] text-foreground/70">
        <div className="font-semibold uppercase tracking-[0.25em] text-foreground/60">
          Your pieces
        </div>
        <div className="flex flex-wrap gap-2">
          {current.tokens.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleTokenClick(idx)}
              disabled={phase !== "rolled" || dice == null || winner !== null || !isMyTurn}
              className="flex min-w-[70px] flex-col items-center rounded-2xl bg-black/40 px-3 py-2 text-[11px] shadow-inner disabled:opacity-60"
            >
              <span
                className="mb-1 flex h-5 w-5 items-center justify-center rounded-full border border-foreground/40"
                style={{ backgroundColor: current.color }}
              >
                {idx + 1}
              </span>
              <span>
                {t.state === "home"
                  ? "Home"
                  : t.state === "done"
                  ? "Finished"
                  : `On track (${t.steps})`}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="self-end rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70 hover:bg-black/40"
        >
          Reset game
        </button>
      </div>
    </div>
  );
}
