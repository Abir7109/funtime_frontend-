"use client";

/*
 * chess.js and react-chessboard expose a few loose APIs that are easiest
 * to integrate with `any` in small, well-contained spots.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Socket } from "socket.io-client";

type TurnColor = "w" | "b";

// Wrapper to avoid mismatched type definitions vs runtime API.
// We still pass the correct runtime props (position, boardWidth, etc.).
const ChessboardAny: any = Chessboard;

function createInitialGame(): Chess {
  return new Chess();
}

function getBoardSizeFromWindow(): number {
  if (typeof window === "undefined") return 360;
  return Math.min(window.innerWidth - 48, 480);
}

type PlayerColor = "w" | "b" | null;

interface ChessBoardProps {
  socket?: Socket | null;
  roomCode?: string;
  playerColor?: PlayerColor;
  opponentLeft?: boolean;
}

export default function ChessBoard({ socket, roomCode, playerColor, opponentLeft }: ChessBoardProps) {
  const [game, setGame] = useState<Chess>(() => createInitialGame());
  // Start with a fixed value so SSR and initial client render match; adjust in
  // an effect once the window size is known.
  const [boardSize, setBoardSize] = useState<number>(360);
  const [turn, setTurn] = useState<TurnColor>("w");
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [squareStyles, setSquareStyles] = useState<Record<string, CSSProperties>>({});
  const [invalidMoveMsg, setInvalidMoveMsg] = useState<string | null>(null);
  const invalidMoveTimeoutRef = useRef<number | null>(null);
  const isNetworked = Boolean(socket && roomCode);
  // When in a networked room, wait for the server to send the current FEN
  // before rendering the board so it doesn't briefly look "reset" on refresh.
  const [hasSyncedFromServer, setHasSyncedFromServer] = useState<boolean>(() => !isNetworked);

  const showInvalidMove = (message = "Invalid move") => {
    setInvalidMoveMsg(message);
    if (invalidMoveTimeoutRef.current != null) {
      window.clearTimeout(invalidMoveTimeoutRef.current);
    }
    invalidMoveTimeoutRef.current = window.setTimeout(() => {
      setInvalidMoveMsg(null);
      invalidMoveTimeoutRef.current = null;
    }, 1600);
  };

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(getBoardSizeFromWindow());
    };

    // Set once on mount, then on resize.
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (invalidMoveTimeoutRef.current != null) {
        window.clearTimeout(invalidMoveTimeoutRef.current);
      }
    };
  }, []);

  // chess.js has historically used snake_case APIs (game_over, in_checkmate, etc.)
  // but its type definitions may expose camelCase variants. Use a loose cast so
  // we can call whichever exists at runtime without TypeScript errors.
  const chessAny = game as any;

  const isGameOver = useMemo(
    () =>
      Boolean(
        chessAny.game_over?.() ??
          chessAny.isGameOver?.() ??
          chessAny.isGameOver?.call?.(chessAny),
      ),
    [chessAny],
  );

  const isInCheck = useMemo(() => {
    if (isGameOver) return false;
    return (
      chessAny.in_check?.() ??
      chessAny.isCheck?.() ??
      chessAny.isCheck?.call?.(chessAny)
    );
  }, [chessAny, isGameOver]);

  const statusText = useMemo(() => {
    if (isGameOver) {
      const inCheckmate =
        chessAny.in_checkmate?.() ??
        chessAny.isCheckmate?.() ??
        chessAny.isCheckmate?.call?.(chessAny);
      const inStalemate =
        chessAny.in_stalemate?.() ??
        chessAny.isStalemate?.() ??
        chessAny.isStalemate?.call?.(chessAny);
      const insufficientMaterial =
        chessAny.insufficient_material?.() ??
        chessAny.isInsufficientMaterial?.() ??
        chessAny.isInsufficientMaterial?.call?.(chessAny);
      const threefold =
        chessAny.in_threefold_repetition?.() ??
        chessAny.isThreefoldRepetition?.() ??
        chessAny.isThreefoldRepetition?.call?.(chessAny);
      const isDraw = chessAny.in_draw?.() ?? chessAny.isDraw?.() ?? chessAny.isDraw?.call?.(chessAny);

      if (inCheckmate) {
        const loser = chessAny.turn?.() as TurnColor;
        const winner = loser === "w" ? "Black" : "White";
        return `Checkmate \u00019 ${winner} wins`;
      }
      if (inStalemate) return "Game over \u00019 Stalemate";
      if (insufficientMaterial) return "Game over \u00019 Draw by insufficient material";
      if (threefold) return "Game over \u00019 Draw by threefold repetition";
      if (isDraw) return "Game over \u00019 Draw";
      return "Game over";
    }

    if (isInCheck) {
      const inCheckColor = (chessAny.turn?.() as TurnColor) === "w" ? "White" : "Black";
      return `Check \u00019 ${inCheckColor} is in check`;
    }

    return "Drag and drop pieces. Chess rules are enforced by chess.js.";
  }, [chessAny, isGameOver, isInCheck]);

  const updateHighlights = (selected: string | null, targets: string[]) => {
    const styles: Record<string, CSSProperties> = {};

    if (selected) {
      styles[selected] = {
        boxShadow: "inset 0 0 0 3px rgba(250, 204, 21, 0.95)", // yellow ring for selected
      };
    }

    for (const sq of targets) {
      styles[sq] = {
        boxShadow: "inset 0 0 0 3px rgba(59, 130, 246, 0.95)", // blue ring for legal move
      };
    }

    setSquareStyles(styles);
  };

  const previewFromSquare = (square: string) => {
    if (isGameOver) return;

    const currentTurn = game.turn() as TurnColor;
    // In a networked game, only the player whose color is to move may select.
    if (isNetworked) {
      if (!playerColor) return;
      if (playerColor !== currentTurn) return;
    }
    const piece = game.get(square as any) as { color: TurnColor } | null;
    const pieceColor = piece?.color ?? null;

    if (!pieceColor || pieceColor !== currentTurn) return;

    const gameCopy = new Chess(game.fen());
    const moves = gameCopy.moves({ square: square as any, verbose: true }) as any[];
    const targets = moves.map((m) => m.to as string);
    setSelectedSquare(square);
    setLegalTargets(targets);
    updateHighlights(square, targets);
  };

  // Helper that wraps chess.js move in try/catch so illegal moves don't throw
  // runtime errors; instead we can show a themed invalid-move message.
  const tryMove = (gameInstance: Chess, from: string, to: string) => {
    try {
      return (gameInstance as any).move({ from, to, promotion: "q" });
    } catch (err) {
      // chess.js throws on invalid moves; we handle that gracefully.
      if (process.env.NODE_ENV !== "production") {
        console.warn("Invalid move caught in tryMove", { from, to }, err);
      }
      return null;
    }
  };

  const handleSquareClick = (square: string) => {
    if (isGameOver) return;

    const currentTurn = game.turn() as TurnColor;
    // In a networked game, only the active player may act.
    if (isNetworked) {
      if (!playerColor) {
        showInvalidMove("You are a spectator in this game");
        return;
      }
      if (playerColor !== currentTurn) {
        showInvalidMove("Not your turn");
        return;
      }
    }
    const gameCopy = new Chess(game.fen());
    const piece = gameCopy.get(square as any) as { color: TurnColor } | null;
    const pieceColor = piece?.color ?? null;

    // No square selected yet: select a piece of the side to move
    if (!selectedSquare) {
      if (!pieceColor || pieceColor !== currentTurn) return;
      previewFromSquare(square);
      return;
    }

    // Clicking the same square cancels selection
    if (square === selectedSquare) {
      setSelectedSquare(null);
      setLegalTargets([]);
      updateHighlights(null, []);
      return;
    }

    // Clicking another own piece switches selection
    if (pieceColor === currentTurn && !legalTargets.includes(square)) {
      previewFromSquare(square);
      return;
    }

    // If this square is not a legal target, it's an invalid move
    if (!legalTargets.includes(square)) {
      showInvalidMove();
      return;
    }

    // Attempt the move
    const move = tryMove(gameCopy, selectedSquare, square);
    if (!move) {
      showInvalidMove();
      return;
    }

    setGame(gameCopy);
    setTurn(gameCopy.turn() as TurnColor);
    setSelectedSquare(null);
    setLegalTargets([]);
    updateHighlights(null, []);

    if (socket && roomCode) {
      socket.emit("chess_move", roomCode, { from: selectedSquare, to: square, promotion: "q" });
    }
  };

  const handlePieceDrop = (source: string, target: string): boolean => {
    if (isGameOver) return false;

    const currentTurn = game.turn() as TurnColor;
    if (isNetworked) {
      if (!playerColor) {
        showInvalidMove("You are a spectator in this game");
        return false;
      }
      if (playerColor !== currentTurn) {
        showInvalidMove("Not your turn");
        return false;
      }
    }

    const gameCopy = new Chess(game.fen());
    const move = tryMove(gameCopy, source, target);

    if (move == null) {
      showInvalidMove();
      return false; // illegal move
    }

    setGame(gameCopy);
    setTurn(gameCopy.turn() as TurnColor);
    setSelectedSquare(null);
    setLegalTargets([]);
    updateHighlights(null, []);

    if (socket && roomCode) {
      socket.emit("chess_move", roomCode, { from: source, to: target, promotion: "q" });
    }

    return true;
  };

  const resetGame = () => {
    const fresh = createInitialGame();
    setGame(fresh);
    setTurn("w");
    setSelectedSquare(null);
    setLegalTargets([]);
    updateHighlights(null, []);

    if (socket && roomCode) {
      socket.emit("chess_reset", roomCode);
    }
  };

  // When connected to a room via socket, listen for server-driven chess
  // position updates so both players stay in sync on the same board.
  useEffect(() => {
    if (!socket || !roomCode) return;

    const handlePosition = ({ fen }: { fen: string }) => {
      if (!fen) return;
      // If this update doesn't change the position we already have, skip
      // re-creating the Chess instance to avoid double renders.
      if (fen === game.fen()) {
        setHasSyncedFromServer(true);
        return;
      }
      const newGame = new Chess(fen);
      setGame(newGame);
      setTurn(newGame.turn() as TurnColor);
      setSelectedSquare(null);
      setLegalTargets([]);
      updateHighlights(null, []);
      setHasSyncedFromServer(true);
    };

    const handleInvalid = () => {
      // Server rejected a move; show the same invalid message used locally.
      showInvalidMove();
    };

    socket.on("chess_position", handlePosition);
    socket.on("chess_invalid", handleInvalid);

    return () => {
      socket.off("chess_position", handlePosition);
      socket.off("chess_invalid", handleInvalid);
    };
  }, [socket, roomCode, game]);

  useEffect(() => {
    if (!socket || !roomCode || !isNetworked || hasSyncedFromServer) return;
    socket.emit("chess_request_state", roomCode);
  }, [socket, roomCode, isNetworked, hasSyncedFromServer]);

  const boardOrientation = useMemo<"white" | "black">(
    () => {
      // In a networked game, orient the board so each player sees their own
      // pieces at the bottom. In local/preview mode, default to white.
      if (!isNetworked) return "white";
      return playerColor === "b" ? "black" : "white";
    },
    [isNetworked, playerColor],
  );

  const isPlayersKingInCheck = useMemo(() => {
    if (!isInCheck || isGameOver) return false;
    const sideToMove = chessAny.turn?.() as TurnColor;
    if (!sideToMove) return false;
    if (!isNetworked) return true;
    if (!playerColor) return false;
    return playerColor === sideToMove;
  }, [isInCheck, isGameOver, chessAny, isNetworked, playerColor]);

  // Fallback: if, for some reason, the server never sends a FEN for this
  // room (e.g. transient network hiccup), stop blocking the board after a
  // short delay so the user still sees *something* instead of being stuck.
  useEffect(() => {
    if (!isNetworked || hasSyncedFromServer) return;
    const timeoutId = window.setTimeout(() => {
      setHasSyncedFromServer(true);
    }, 2500);
    return () => window.clearTimeout(timeoutId);
  }, [isNetworked, hasSyncedFromServer]);

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex w-full max-w-[min(100vw-48px,480px)] items-center justify-between text-xs text-foreground/70">
        <span>Chess board</span>
        <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          {isGameOver ? "Game over" : `Turn: ${turn === "w" ? "White" : "Black"}`}
        </span>
      </div>
      <div
        className="relative overflow-hidden rounded-2xl border border-foreground/20 bg-black/60 shadow-inner mx-auto w-full max-w-[min(100vw-48px,480px)]"
        style={{ maxWidth: boardSize }}
      >
        {isNetworked && !hasSyncedFromServer ? (
          <div className="flex h-[min(80vw,380px)] items-center justify-center text-xs text-foreground/60">
            Syncing current game from server...
          </div>
        ) : (
          <>
        <ChessboardAny
            options={{
              id: "fun-together-chess-board",
              position: game.fen(),
              boardOrientation,
              boardStyle: {
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.6)",
            },
            squareStyles,
            animationDurationInMs: 100,
            // Only allow dragging for the player whose color is to move in a
            // networked game. In preview mode (no socket/room), allow
            // dragging for both sides.
            allowDragging:
              !isGameOver &&
              (!isNetworked ? true : Boolean(playerColor && playerColor === game.turn())),
             onSquareClick: ({ square }: { square: string; piece: any | null }) => {
              if (!square) return;
              handleSquareClick(square);
            },
            onPieceDrag: ({ square }: { square: string | null; piece: any; isSparePiece: boolean }) => {
              if (!square) return;
              previewFromSquare(square);
            },
            onPieceDrop: ({
              sourceSquare,
              targetSquare,
            }: {
              piece: any;
              sourceSquare: string;
              targetSquare: string | null;
            }) => handlePieceDrop(sourceSquare, targetSquare ?? sourceSquare),
          }}
        />
        {isPlayersKingInCheck && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
            <div className="check-warning-pop pointer-events-auto inline-flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background shadow-lg shadow-red-500/60">
              <span className="check-warning-icon text-sm">⚠</span>
              <span>Check! Protect your king</span>
            </div>
          </div>
        )}
        {opponentLeft && !isGameOver && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <div className="game-over-pop pointer-events-auto mx-4 max-w-xs rounded-3xl bg-black/85 px-5 py-4 text-center shadow-2xl ring-1 ring-cyan/40">
              <p className="text-sm font-semibold text-sand">Opponent left the room</p>
              <p className="mt-1 text-xs text-foreground/75">
                You can keep exploring the board, or head back to choose a new game.
              </p>
            </div>
          </div>
        )}
        {isGameOver && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="game-over-pop pointer-events-auto relative mx-4 max-w-xs rounded-3xl bg-black/85 px-5 py-4 text-center shadow-2xl ring-1 ring-white/10">
              <p className="text-sm font-semibold text-sand">
                {statusText.startsWith("Checkmate") ? "Checkmate" : "Game over"}
              </p>
              <p className="mt-1 text-xs text-foreground/70">
                {statusText}
              </p>
            </div>
          </div>
        )}
          </>
        )}
      </div>
      <div className="flex w-full max-w-[min(100vw-48px,480px)] items-center justify-between text-[11px] text-foreground/60">
        <p className={invalidMoveMsg ? "text-[11px] text-orange" : undefined}>
          {invalidMoveMsg ?? statusText}
        </p>
        <button
          type="button"
          onClick={resetGame}
          className="rounded-full border border-foreground/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70 hover:bg-black/40"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
