export type GameKey = "chess";

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
