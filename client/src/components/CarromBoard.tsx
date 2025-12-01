"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { CarromBoardState, CarromShotPayload } from "@/lib/carrom/types";

interface CarromBoardProps {
  socket?: Socket | null;
  roomCode?: string;
}

export default function CarromBoard({ socket, roomCode }: CarromBoardProps) {
  const [state, setState] = useState<CarromBoardState | null>(null);
  const [baselineX, setBaselineX] = useState(0.5);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  const isNetworked = Boolean(socket && roomCode);
  const boardRef = useRef<HTMLDivElement | null>(null);

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

  const boardCoins = state?.coins ?? [];
  const striker = state?.striker ?? { position: { x: baselineX, y: 0.9 }, radius: 0 };

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

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!canShoot || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Only start drag near bottom baseline.
    if (y < 0.75) return;
    setBaselineX(Math.min(0.85, Math.max(0.15, x)));
    setDragStart({ x, y });
    setDragCurrent({ x, y });
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setDragCurrent({ x, y });
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart || !dragCurrent || !socket || !roomCode || !canShoot || !boardRef.current) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }
    const baseX = baselineX;
    const baseY = 0.9;
    const dx = dragCurrent.x - baseX;
    const dy = dragCurrent.y - baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.03) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }
    // Direction is from baseline into the board (opposite of drag).
    const dirX = -dx;
    const dirY = -dy;
    const angle = Math.atan2(dirY, dirX);
    const power = Math.min(1, Math.max(0.2, dist * 3));
    const payload: CarromShotPayload = {
      angle,
      power,
      baselineX: baseX,
    };
    socket.emit("carrom_shot", roomCode, payload);
    setDragStart(null);
    setDragCurrent(null);
  };

  const aimingLine = useMemo(() => {
    if (!dragStart || !dragCurrent) return null;
    const baseY = 0.9;
    const dx = dragCurrent.x - baselineX;
    const dy = dragCurrent.y - baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI;
    const length = Math.min(0.4, dist * 1.2);
    return { angle, length };
  }, [dragStart, dragCurrent, baselineX]);

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
        <div
          ref={boardRef}
          className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-black/80"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
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
            {aimingLine && (
              <div
                className="pointer-events-none absolute w-px origin-bottom bg-gradient-to-t from-cyan-300/90 to-transparent"
                style={{
                  left: `${baselineX * 100}%`,
                  bottom: "8%",
                  height: `${aimingLine.length * 100}%`,
                  transform: `translateX(-50%) rotate(${aimingLine.angle}deg)`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
