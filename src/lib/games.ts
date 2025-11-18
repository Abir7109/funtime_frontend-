export type GameKey = "ludo" | "chess";

export interface GameConfig {
  key: GameKey;
  title: string;
  icon: string;
  badge: string;
  desc: string;
  players: string;
  time: string;
  accent: string;
}

export const games: GameConfig[] = [
  {
    key: "ludo",
    title: "Ludo",
    icon: "🎲",
    badge: "Family favourite",
    desc: "Race your tokens home while blocking your friends. Easy to explain, hard to stop playing.",
    players: "2–4 players",
    time: "15–30 min",
    accent: "from-yellow to-orange",
  },
  {
    key: "chess",
    title: "Chess",
    icon: "♟️",
    badge: "Classic duel",
    desc: "Think ahead, set traps, and checkmate in this timeless strategy game.",
    players: "2 players",
    time: "30–60 min",
    accent: "from-sky to-cyan",
  },
];
