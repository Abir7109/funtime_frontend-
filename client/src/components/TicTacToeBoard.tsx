"use client";

import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";

interface TicTacToeBoardProps {
  socket?: Socket | null;
  roomCode?: string;
  playerSymbol?: "X" | "O" | null;
  playerName?: string;
}

interface ServerState {
  board: ("X" | "O" | null)[];
  next: "X" | "O" | null;
  winner: "X" | "O" | "draw" | null;
}

const emptyBoard: ServerState["board"] = Array(9).fill(null);

export default function TicTacToeBoard({ socket, roomCode, playerSymbol, playerName }: TicTacToeBoardProps) {
  const [state, setState] = useState<ServerState>({
    board: emptyBoard,
    next: "X",
    winner: null,
  });

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

    socket.emit("tictactoe_request_state", roomCode);
    socket.on("tictactoe_state", handleState);

    return () => {
      socket.off("tictactoe_state", handleState);
    };
  }, [socket, roomCode, isNetworked]);

  const makeMove = (index: number) => {
    if (state.winner) return;

    if (isNetworked) {
      if (!socket || !roomCode) return;
      // Let the server decide if this socket is allowed to move (X/O + turn).
      socket.emit("tictactoe_move", roomCode, index);
      return;
    }

    if (state.board[index] || !state.next) return;
    const board = state.board.slice();
    board[index] = state.next;
    const winner = computeWinner(board);
    setState({
      board,
      next: winner ? null : state.next === "X" ? "O" : "X",
      winner,
    });
  };

  const handleReset = () => {
    if (isNetworked && socket && roomCode) {
      socket.emit("tictactoe_reset", roomCode);
    } else {
      setState({ board: emptyBoard, next: "X", winner: null });
    }
  };

  const winningLine = useMemo(() => {
    if (state.winner !== "X" && state.winner !== "O") return null;
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (
        state.board[a] === state.winner &&
        state.board[b] === state.winner &&
        state.board[c] === state.winner
      ) {
        return [a, b, c] as [number, number, number];
      }
    }
    return null;
  }, [state.board, state.winner]);

  const statusText = useMemo(() => {
    if (state.winner === "draw") return "Draw game";
    if (state.winner === "X" || state.winner === "O") return `${state.winner} wins`;
    if (!state.next) return "Game over";
    return `Turn: ${state.next}`;
  }, [state]);

  const winnerMessage = useMemo(() => {
    if (state.winner === "draw") return "It's a draw. Well played both!";
    if (state.winner !== "X" && state.winner !== "O") return "";
    if (!playerSymbol) return `${state.winner} wins this round!`;
    if (playerSymbol === state.winner) {
      const name = playerName && playerName.trim().length > 0 ? playerName.trim() : "You";
      return `${name} win this round!`;
    }
    return "You lost this round. Hit reset for a rematch.";
  }, [state.winner, playerSymbol, playerName]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-xs items-center justify-between text-xs text-foreground/70">
        <span>Tic Tac Toe</span>
        <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          {statusText}
        </span>
      </div>
      <div className="relative mx-auto w-full max-w-xs rounded-2xl border border-foreground/20 bg-black/60 p-3 shadow-inner">
        <div className="grid aspect-square w-full grid-cols-3 gap-2">
          {state.board.map((cell, idx) => {
            const isMine = cell && playerSymbol && cell === playerSymbol;
            const isWinningCell = winningLine?.includes(idx) ?? false;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => makeMove(idx)}
                className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-3xl font-black text-sand shadow-md transition hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 ${
                  isWinningCell ? "ring-2 ring-yellow-400 shadow-yellow-400/70 scale-[1.03]" : ""
                }`}
                disabled={Boolean(state.winner || cell)}
              >
                {cell && (
                  <span
                    className={`drop-shadow-lg ${
                      cell === "X" ? "text-cyan-300" : "text-pink-300"
                    } ${isMine ? "scale-110" : "scale-100"}`}
                  >
                    {cell}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {state.winner && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto mx-4 max-w-xs animate-bounce rounded-3xl bg-gradient-to-r from-yellow-400/90 via-amber-300/95 to-pink-400/90 px-5 py-4 text-center text-xs font-semibold text-slate-900 shadow-[0_0_40px_rgba(250,204,21,0.8)] ring-1 ring-yellow-200/80">
              <div className="mb-1 text-lg">✨ {statusText} ✨</div>
              <div className="text-[11px] font-medium">{winnerMessage}</div>
            </div>
          </div>
        )}
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

function computeWinner(board: ("X" | "O" | null)[]): ServerState["winner"] {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((c) => c)) return "draw";
  return null;
}
