"use client";

import { useMemo } from "react";
import { Card, SectionTitle, Stat } from "./Card";
import { fmtTime, leaderboard } from "../lib/utils";
import { QUESTIONS } from "../lib/questions";
import type { Users } from "../lib/types";

/**
 * Two-column dashboard: leaderboard with stats on the left, signed-in
 * user info + play button on the right.
 */
export function Dashboard({
  me,
  users,
  onPlay,
}: {
  me: string;
  users: Users;
  onPlay: () => void;
}) {
  const rows = useMemo(() => leaderboard(users), [users]);
  const totalAttempts = rows.reduce((s, r) => s + r.attempts, 0);
  const completed = rows.filter((r) => r.bestScore !== null).length;
  const topScore =
    rows[0] && rows[0].bestScore !== null ? rows[0].bestScore : 0;
  const myRow = rows.find((r) => r.phone === me);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-5">
      <Card title="~/dashboard/leaderboard.tsv">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <Stat k="total_users" v={String(rows.length)} accent="acc2" />
          <Stat k="completed" v={String(completed)} />
          <Stat k="attempts" v={String(totalAttempts)} accent="warn" />
          <Stat
            k="top_score"
            v={`${topScore}/${QUESTIONS.length}`}
            accent="acc"
          />
        </div>

        <SectionTitle>// scores</SectionTitle>
        {rows.length === 0 ? (
          <div className="text-center text-[#5b6b7d] py-6 text-xs">
            no users yet — be the first to play.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#0b1017] text-[11px] uppercase tracking-wider text-[#8895a7]">
                  <th className="text-left px-3 py-2.5 w-14 font-medium">#</th>
                  <th className="text-left px-3 py-2.5 font-medium">user</th>
                  <th className="text-right px-3 py-2.5 font-medium">best</th>
                  <th className="text-right px-3 py-2.5 font-medium">time</th>
                  <th className="text-right px-3 py-2.5 font-medium">runs</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const rankColor =
                    i === 0
                      ? "text-[#ffd76b]"
                      : i === 1
                        ? "text-[#cfd8e3]"
                        : i === 2
                          ? "text-[#e0a458]"
                          : "text-[#5b6b7d]";
                  const isMe = r.phone === me;
                  return (
                    <tr
                      key={r.phone}
                      className="border-t border-[#1c2530] hover:bg-[#0c121a]"
                    >
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-block min-w-[22px] ${rankColor}`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-2.5 ${isMe ? "text-[#82aaff]" : "text-[#d6deeb]"}`}
                      >
                        {r.phone}
                        {isMe && (
                          <span className="ml-2 px-2 py-0.5 rounded-full border border-[#1c2530] bg-[#0b1017] text-[#8895a7] text-[11px]">
                            you
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[#7fdbca] tabular-nums">
                        {r.bestScore === null
                          ? "—"
                          : `${r.bestScore}/${r.total}`}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[#5b6b7d] tabular-nums">
                        {r.bestTime === null ? "—" : fmtTime(r.bestTime)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[#5b6b7d] tabular-nums">
                        {r.attempts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="~/play/launch.sh">
        <SectionTitle>// session</SectionTitle>
        <div className="rounded-lg border border-[#1c2530] bg-[#0f141b] p-3.5 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-[#5b6b7d]">
            signed_in_as
          </div>
          <div className="text-[#82aaff] text-base font-semibold mt-1">{me}</div>
        </div>

        <SectionTitle>// your stats</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat k="runs" v={String(myRow ? myRow.attempts : 0)} />
          <Stat
            k="best"
            v={
              myRow && myRow.bestScore !== null
                ? `${myRow.bestScore}/${QUESTIONS.length}`
                : "—"
            }
            accent="acc"
          />
        </div>

        <button
          onClick={onPlay}
          className="w-full px-4 py-3.5 rounded-md bg-[#7fdbca] text-[#06222a] font-bold hover:brightness-110 active:translate-y-px transition flex items-center justify-center gap-2"
        >
          ▶ start_quiz()
          <span className="opacity-70 font-normal">
            — {QUESTIONS.length} questions
          </span>
        </button>
        <p className="text-[#5b6b7d] text-xs mt-3 leading-6">
          // pick the correct answer for each question.
          <br />
          // your best score is what shows on the leaderboard.
        </p>
      </Card>
    </div>
  );
}
