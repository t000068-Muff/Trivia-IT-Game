"use client";

import { Card, SectionTitle } from "./Card";
import { fmtTime } from "../lib/utils";
import { QUESTIONS } from "../lib/questions";

/**
 * Final score, verdict, and a per-question review highlighting the
 * correct answer (green) and any wrong pick (red).
 */
export function Result({
  score,
  timeSec,
  answers,
  onAgain,
  onBack,
}: {
  score: number;
  timeSec: number;
  answers: (number | null)[];
  onAgain: () => void;
  onBack: () => void;
}) {
  const total = QUESTIONS.length;
  const pct = Math.round((score * 100) / total);
  const verdict =
    pct >= 90
      ? "// excellent. you know your stack."
      : pct >= 70
        ? "// solid. a few rough edges."
        : pct >= 50
          ? "// passable. review the misses."
          : "// keep practicing — fundamentals first.";

  return (
    <div className="max-w-3xl mx-auto">
      <Card title="~/quiz/result.json">
        <div className="text-center pt-3 pb-4">
          <span className="px-2 py-0.5 rounded-full border border-[#1c2530] bg-[#0b1017] text-[#8895a7] text-[11px]">
            run complete
          </span>
          <div className="text-5xl font-bold text-[#7fdbca] tracking-wide mt-2">
            {score}
            <small className="text-sm text-[#5b6b7d] font-normal ml-1">
              / {total}
            </small>
          </div>
          <div className="text-[#8895a7] text-[13px] mb-2">
            {verdict} &nbsp;·&nbsp; {pct}% &nbsp;·&nbsp; time{" "}
            {fmtTime(timeSec)}
          </div>
        </div>

        <SectionTitle>// review</SectionTitle>
        <div className="space-y-4">
          {QUESTIONS.map((q, i) => {
            const ans = answers[i];
            const correct = q.a;
            const ok = ans === correct;
            return (
              <div key={i}>
                <div className="flex justify-between text-xs text-[#5b6b7d] mb-1.5">
                  <span>q{String(i + 1).padStart(2, "0")}</span>
                  <span className={ok ? "text-[#9ece6a]" : "text-[#ff6b6b]"}>
                    {ok ? "✓ correct" : "× wrong"}
                  </span>
                </div>
                <div
                  className="text-sm text-[#d6deeb] mb-2.5 leading-6"
                  dangerouslySetInnerHTML={{ __html: q.q }}
                />
                <div className="grid gap-2">
                  {q.opts.map((o, j) => {
                    const isCorrect = j === correct;
                    const isWrongPick = j === ans && !ok;
                    const cls = isCorrect
                      ? "border-[#9ece6a] bg-[#9ece6a]/[0.07]"
                      : isWrongPick
                        ? "border-[#ff6b6b] bg-[#ff6b6b]/[0.07]"
                        : "border-[#1c2530] bg-[#0b1017]";
                    return (
                      <div
                        key={j}
                        className={`px-3.5 py-2.5 rounded-md border flex gap-3 items-start ${cls}`}
                      >
                        <span className="text-[11px] text-[#8895a7] border border-[#1c2530] rounded px-1.5 py-0.5 min-w-[22px] text-center">
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: o }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={onAgain}
            className="px-4 py-2.5 rounded-md bg-[#7fdbca] text-[#06222a] font-bold hover:brightness-110 active:translate-y-px transition"
          >
            ↻ play_again()
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-md border border-[#1c2530] text-[#d6deeb] hover:border-[#82aaff] hover:text-[#82aaff] transition"
          >
            ← dashboard
          </button>
        </div>
      </Card>
    </div>
  );
}
