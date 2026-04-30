import type { LeaderboardRow, Users } from "./types";
import { QUESTIONS } from "./questions";

export const isPhone = (s: string): boolean =>
  /^\+?[0-9 \-]{7,16}$/.test(s.trim());

export const genOTP = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (m ? m + "m " : "") + s + "s";
}

/** Derive a sorted leaderboard from a Users map. */
export function leaderboard(users: Users): LeaderboardRow[] {
  const rows: LeaderboardRow[] = Object.values(users).map((u) => {
    if (!u.attempts || u.attempts.length === 0) {
      return {
        phone: u.phone,
        bestScore: null,
        total: QUESTIONS.length,
        attempts: 0,
        bestTime: null,
        lastTs: 0,
      };
    }
    const best = u.attempts.reduce((a, b) =>
      b.score > a.score
        ? b
        : b.score === a.score && b.timeSec < a.timeSec
          ? b
          : a,
    );
    const last = u.attempts[u.attempts.length - 1];
    return {
      phone: u.phone,
      bestScore: best.score,
      total: best.total,
      attempts: u.attempts.length,
      bestTime: best.timeSec,
      lastTs: last.ts,
    };
  });
  rows.sort((a, b) => {
    const sa = a.bestScore ?? -1;
    const sb = b.bestScore ?? -1;
    if (sb !== sa) return sb - sa;
    const ta = a.bestTime ?? 1e9;
    const tb = b.bestTime ?? 1e9;
    if (ta !== tb) return ta - tb;
    return (b.lastTs || 0) - (a.lastTs || 0);
  });
  return rows;
}
