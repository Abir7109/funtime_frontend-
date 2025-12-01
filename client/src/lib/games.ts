export type GameKey = "chess" | "tictactoe";

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
];
