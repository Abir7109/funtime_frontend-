"use client";

import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";

interface ConnectFourBoardProps {
  socket?: Socket | null;
  roomCode?: string;
  playerSymbol?: "R" | "Y" | null;
  playerName?: string;
}

interface ServerState {
  board: ("R" | "Y" | null)[]; // length 42 (7x6), column-major
  next: "R" | "Y" | null;
  winner: "R" | "Y" | "draw" | null;
}

const EMPTY_BOARD: ServerState["board"] = Array(7 * 6).fill(null);
const WIDTH = 7;
const HEIGHT = 6;

export default function ConnectFourBoard({ socket, roomCode, playerSymbol, playerName }: ConnectFourBoardProps) {
  const [state, setState] = useState<ServerState>({ board: EMPTY_BOARD, next: "R", winner: null });

  const isNetworked = Boolean(socket && roomCode);

  useEffect(() => {
    if (!socket || !roomCode || !isNetworked) return;

    const handleState = (s: ServerState) => {
      if (!s || !Array.isArray(s.board)) return;
      setState({
        board: s.board as ServerState["board"],
        next: s.next,
        winner: s.winner,
      });
    };

    socket.emit("connect4_request_state", roomCode);
    socket.on("connect4_state", handleState);

    return () => {
      socket.off("connect4_state", handleState);
    };
  }, [socket, roomCode, isNetworked]);

  const dropDisc = (col: number) => {
    if (state.winner) return;
    if (col < 0 || col >= WIDTH) return;

    // Always update locally for an instant response.
    const board = state.board.slice();
    let placedRow: number | null = null;
    for (let row = 0; row < HEIGHT; row++) {
      const idx = col * HEIGHT + row;
      if (!board[idx]) {
        board[idx] = state.next;
        placedRow = row;
        break;
      }
    }
    if (placedRow == null) return; // column full

    const winner = computeLocalWinner(board);
    setState({
      board,
      next: winner ? null : state.next === "R" ? "Y" : "R",
      winner,
    });

    // In a networked room, also notify the server so the other player stays in sync.
    if (isNetworked && socket && roomCode) {
      socket.emit("connect4_move", roomCode, col);
    }
  };

  const handleReset = () => {
    if (isNetworked && socket && roomCode) {
      socket.emit("connect4_reset", roomCode);
    } else {
      setState({ board: EMPTY_BOARD, next: "R", winner: null });
    }
  };

  const statusText = useMemo(() => {
    if (state.winner === "draw") return "Draw game";
    if (state.winner === "R") return "Red wins";
    if (state.winner === "Y") return "Yellow wins";
    if (!state.next) return "Game over";
    return `Turn: ${state.next === "R" ? "Red" : "Yellow"}`;
  }, [state]);

  const winningCells = useMemo(() => {
    if (state.winner !== "R" && state.winner !== "Y") return null;
    return findWinningLine(state.board, state.winner);
  }, [state.board, state.winner]);

  const winnerMessage = useMemo(() => {
    if (state.winner === "draw") return "It's a draw. Nice balance!";
    if (state.winner !== "R" && state.winner !== "Y") return "";
    if (!playerSymbol) return `${state.winner === "R" ? "Red" : "Yellow"} connects four!`;
    if (playerSymbol === state.winner) {
      const name = playerName && playerName.trim().length > 0 ? playerName.trim() : "You";
      return `${name} win this round!`;
    }
    return "You lost this round. Hit reset for a rematch.";
  }, [state.winner, playerSymbol, playerName]);

  const renderCell = (row: number, col: number) => {
    const idx = col * HEIGHT + row;
    const cell = state.board[idx];
    const isWinning = winningCells?.includes(idx) ?? false;
    const isMine = cell && playerSymbol && cell === playerSymbol;

    const baseColor =
      cell === "R" ? "bg-red-400" : cell === "Y" ? "bg-yellow-300" : "bg-slate-800/80";

    return (
      <div
        key={`${col}-${row}`}
        className="flex items-center justify-center"
      >
        <div
          className={`h-8 w-8 rounded-full border border-slate-900/60 shadow-inner transition-transform ${
            cell
              ? `${baseColor} ${isMine ? "scale-110" : "scale-100"} ${
                  isWinning ? "ring-2 ring-emerald-300 shadow-emerald-400/70" : ""
                }`
              : "bg-slate-900/60"
          }`}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-sm items-center justify-between text-xs text-foreground/70">
        <span>Connect Four</span>
        <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          {statusText}
        </span>
      </div>
      <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-foreground/20 bg-black/60 p-3 shadow-inner">
        <div className="mb-2 flex items-center justify-between text-[10px] text-foreground/60">
          <span>Drop your discs into the columns.</span>
          <span>{isNetworked ? "Online room" : "Local preview"}</span>
        </div>
        <div className="relative aspect-[7/6] w-full rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-2">
          {/* Clickable columns (sit on top of discs) */}
          <div className="absolute inset-0 z-10 grid grid-cols-7">
            {Array.from({ length: WIDTH }).map((_, col) => (
              <button
                key={col}
                type="button"
                onClick={() => dropDisc(col)}
                className="group relative flex cursor-pointer flex-col justify-start bg-transparent/0"
                disabled={Boolean(state.winner)}
              >
                <div className="pointer-events-none mx-auto mb-1 h-1.5 w-5 rounded-full bg-cyan-400/70 opacity-0 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>
          {/* Grid discs (allow clicks to fall through to column buttons above) */}
          <div className="relative grid h-full grid-cols-7 grid-rows-6 gap-1 pointer-events-none">
            {Array.from({ length: HEIGHT })
              .map((_, row) => row)
              .reverse()
              .flatMap((row) =>
                Array.from({ length: WIDTH }).map((_, col) => renderCell(row, col)),
              )}
          </div>
          {/* Win overlay */}
          {state.winner && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto mx-4 max-w-xs animate-bounce rounded-3xl bg-gradient-to-r from-sky-400/95 via-cyan-300/95 to-emerald-300/95 px-5 py-4 text-center text-xs font-semibold text-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.8)] ring-1 ring-sky-200/80">
                <div className="mb-1 text-lg">✨ {statusText} ✨</div>
                <div className="text-[11px] font-medium">{winnerMessage}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="rounded-full border border-foreground/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70 hover:bg-black/40"
      >
        Reset board
      </button>
    </div>
  );
}

function findWinningLine(board: ("R" | "Y" | null)[], winner: "R" | "Y"): number[] | null {
  const width = WIDTH;
  const height = HEIGHT;
  const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
  ];
  const get = (x: number, y: number): "R" | "Y" | null => {
    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return board[x * height + y];
  };
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (get(x, y) !== winner) continue;
      for (const { dx, dy } of directions) {
        const cells: number[] = [];
        for (let step = 0; step < 4; step++) {
          const nx = x + dx * step;
          const ny = y + dy * step;
          if (get(nx, ny) !== winner) {
            cells.length = 0;
            break;
          }
          cells.push(nx * height + ny);
        }
        if (cells.length === 4) return cells;
      }
    }
  }
  return null;
}

function computeLocalWinner(board: ("R" | "Y" | null)[]): ServerState["winner"] {
  const width = WIDTH;
  const height = HEIGHT;
  const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
  ];
  const get = (x: number, y: number): "R" | "Y" | null => {
    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return board[x * height + y];
  };
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const cell = get(x, y);
      if (!cell) continue;
      for (const { dx, dy } of directions) {
        let count = 1;
        for (let step = 1; step < 4; step++) {
          const nx = x + dx * step;
          const ny = y + dy * step;
          if (get(nx, ny) === cell) {
            count++;
          } else {
            break;
          }
        }
        if (count >= 4) return cell;
      }
    }
  }
  if (board.every((c) => c)) return "draw";
  return null;
}
