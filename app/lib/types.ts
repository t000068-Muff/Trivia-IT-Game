export type Attempt = {
  score: number;
  total: number;
  timeSec: number;
  ts: number;
};

export type User = {
  phone: string;
  attempts: Attempt[];
};

export type Users = Record<string, User>;

export type View = "login" | "dashboard" | "quiz" | "result";

export type Question = {
  q: string;
  opts: string[];
  a: number;
};

/** A row in the leaderboard, derived from a Users map. */
export type LeaderboardRow = {
  phone: string;
  bestScore: number | null;
  total: number;
  attempts: number;
  bestTime: number | null;
  lastTs: number;
};
