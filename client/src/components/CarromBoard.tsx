"use client";

import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import type { CarromBoardState, CarromShotPayload } from "@/lib/carrom/types";

interface CarromBoardProps {
  socket?: Socket | null;
  roomCode?: string;
}

export default function CarromBoard({ socket, roomCode }: CarromBoardProps) {
  const [state, setState] = useState<CarromBoardState | null>(null);
  const [baselineX, setBaselineX] = useState(0.5);
  const [angleDeg, setAngleDeg] = useState(-90); // up by default
  const [power, setPower] = useState(0.6);

  const isNetworked = Boolean(socket && roomCode);

  useEffect(() => {
    if (!socket || !roomCode || !isNetworked) return;

    const handleState = (s: CarromBoardState) => {
      setState(s);
    };

    const request = () => socket.emit("carrom_request_state", roomCode);

    request();
    socket.on("carrom_state", handleState);
    socket.on("connect", request);

    return () => {
      socket.off("carrom_state", handleState);
      socket.off("connect", request);
    };
  }, [socket, roomCode, isNetworked]);

  const canShoot = useMemo(() => {
    if (!state) return false;
    return state.turnPhase === "aiming";
  }, [state]);

  const shoot = () => {
    if (!socket || !roomCode || !canShoot) return;
    const payload: CarromShotPayload = {
      angle: (angleDeg * Math.PI) / 180,
      power,
      baselineX,
    };
    socket.emit("carrom_shot", roomCode, payload);
  };

  const boardCoins = state?.coins ?? [];
  const striker = state?.striker ?? { position: { x: 0.5, y: 0.1 }, radius: 0 };

  const scoresLabel = useMemo(() => {
    if (!state) return "";
    const a = state.players["A"];
    const b = state.players["B"];
    return `${a.username || "A"}: ${a.score} • ${b.username || "B"}: ${b.score}`;
  }, [state]);

  const winnerLabel = useMemo(() => {
    if (!state || !state.winnerPlayer) return "";
    const p = state.players[state.winnerPlayer];
    return `${p.username || state.winnerPlayer} wins the board!`;
  }, [state]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-md items-center justify-between text-xs text-foreground/70">
        <span>Carrom board</span>
        <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          {state ? `Turn: ${state.currentPlayer}` : "Syncing"}
        </span>
      </div>
      <div className="relative mx-auto w-full max-w-md rounded-3xl border border-foreground/20 bg-black/60 p-3 shadow-inner">
        {state && (
          <div className="mb-2 flex items-center justify-between text-[10px] text-foreground/60">
            <span>{scoresLabel}</span>
            <span>
              Board {state.boardNumber} / {state.maxBoards}
            </span>
          </div>
        )}
        <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-black/80">
          {winnerLabel && (
            <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
              <div className="pointer-events-auto rounded-full bg-emerald-500/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-lg shadow-emerald-500/60">
                {winnerLabel}
              </div>
            </div>
          )}
          <img
            src="/carrom-board.jpg"
            alt="Carrom board"
            className="h-full w-full object-cover"
          />
          {/* Coins */}
          <div className="pointer-events-none absolute inset-0">
            {boardCoins.filter((c) => !c.pocketed).map((coin) => {
              const left = `${coin.position.x * 100}%`;
              const top = `${coin.position.y * 100}%`;
              const src =
                coin.color === "queen"
                  ? "/carrom-coin-main.png"
                  : coin.color === "white"
                  ? "/carrom-coin-white.png"
                  : "/carrom-coin-black.png";
              return (
                <img
                  key={coin.id}
                  src={src}
                  alt={coin.color}
                  className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_rgba(15,23,42,0.9)]"
                  style={{ left, top }}
                />
              );
            })}
            {/* Striker */}
            <div
              className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300 bg-cyan-200/80 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
              style={{
                left: `${striker.position.x * 100}%`,
                top: `${striker.position.y * 100}%`,
              }}
            />
          </div>
          {/* Aiming overlay */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="pointer-events-none absolute h-32 w-px origin-bottom bg-gradient-to-t from-cyan-300/90 to-transparent"
              style={{
                left: `${baselineX * 100}%`,
                bottom: "8%",
                transform: `translateX(-50%) rotate(${angleDeg}deg)`,
              }}
            />
          </div>
        </div>
        {/* Controls */}
        <div className="mt-3 flex flex-col gap-2 text-[11px] text-foreground/70">
          <label className="flex flex-col gap-1">
            <span>Striker position</span>
            <input
              type="range"
              min={0.15}
              max={0.85}
              step={0.01}
              value={baselineX}
              onChange={(e) => setBaselineX(parseFloat(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Aim angle</span>
            <input
              type="range"
              min={-150}
              max={-30}
              step={1}
              value={angleDeg}
              onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Power</span>
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.01}
              value={power}
              onChange={(e) => setPower(parseFloat(e.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={shoot}
            disabled={!canShoot}
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-cyan px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-md disabled:opacity-50"
          >
            Shoot
          </button>
        </div>
      </div>
    </div>
  );
}
