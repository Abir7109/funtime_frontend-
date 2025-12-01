export type GameKey = "chess" | "tictactoe" | "connect4";

export interface GameConfig {
  key: GameKey;
  title: string;
  icon: string;
  badge: string;
  desc: string;
  players: string;
  time: string;
  accent: string;
  thumbnailLine: string;
}

export const games: GameConfig[] = [
  {
    key: "chess",
    title: "Chess",
    icon: "♟️",
    badge: "Classic duel",
    desc: "Think ahead, set traps, and checkmate in this timeless strategy game.",
    players: "2 players",
    time: "30–60 min",
    accent: "from-sky to-cyan",
    thumbnailLine: "Beautiful, clear board with real-time updates.",
  },
  {
    key: "tictactoe",
    title: "Tic Tac Toe",
    icon: "⭕",
    badge: "Quick duel",
    desc: "Fast-paced 3×3 battle. Read your opponent and line up three in a row.",
    players: "2 players",
    time: "2–5 min",
    accent: "from-fuchsia to-purple",
    thumbnailLine: "Neon 3×3 grid with glowing X and O highlights.",
  },
  {
    key: "connect4",
    title: "Connect Four",
    icon: "🟡",
    badge: "Drop & connect",
    desc: "Drop discs into a seven-column grid and be the first to connect four in any direction.",
    players: "2 players",
    time: "5–15 min",
    accent: "from-indigo-500 to-sky-500",
    thumbnailLine: "Bright vertical board where chips fall and four-in-a-row wins.",
  },
];
