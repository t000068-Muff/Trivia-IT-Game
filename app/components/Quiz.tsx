"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "./Card";
import { fmtTime } from "../lib/utils";
import { QUESTIONS } from "../lib/questions";

/**
 * Single-question view with progress bar, live timer, prev/next, abort,
 * and A/B/C/D + arrow + Enter keyboard shortcuts.
 */
export function Quiz({
  idx,
  setIdx,
  answers,
  setAnswers,
  startedAt,
  onFinish,
  onAbort,
}: {
  idx: number;
  setIdx: (n: number) => void;
  answers: (number | null)[];
  setAnswers: React.Dispatch<React.SetStateAction<(number | null)[]>>;
  startedAt: number;
  onFinish: (a: (number | null)[]) => void;
  onAbort: () => void;
}) {
  const total = QUESTIONS.length;
  const q = QUESTIONS[idx];
  const [elapsed, setElapsed] = useState(0);
  const [warn, setWarn] = useState("");

  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const select = useCallback(
    (i: number) => {
      setAnswers((prev) => {
        const next = prev.slice();
        next[idx] = i;
        return next;
      });
      setWarn("");
    },
    [idx, setAnswers],
  );

  const goNext = useCallback(() => {
    if (answers[idx] === null || answers[idx] === undefined) {
      setWarn("× select an answer first");
      return;
    }
    if (idx === total - 1) {
      onFinish(answers);
    } else {
      setIdx(idx + 1);
    }
  }, [answers, idx, total, onFinish, setIdx]);

  const goPrev = useCallback(() => {
    if (idx > 0) setIdx(idx - 1);
  }, [idx, setIdx]);

  // keyboard shortcuts (skip when user is typing in a real input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(k)) {
        const i = k.charCodeAt(0) - 65;
        if (i < q.opts.length) select(i);
      } else if (e.key === "Enter" || e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [q.opts.length, select, goNext, goPrev]);

  const handleAbort = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Abort current quiz? Progress will not be saved.")
    ) {
      onAbort();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card title={`~/quiz/q${String(idx + 1).padStart(2, "0")}.md`}>
        {/* progress */}
        <div className="flex gap-1.5 mb-5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`flex-1 h-1 rounded ${
                i < idx
                  ? "bg-[#7fdbca]"
                  : i === idx
                    ? "bg-[#82aaff]"
                    : "bg-[#1c2530]"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs text-[#5b6b7d] mb-2.5">
          <span>
            question {idx + 1} / {total}
          </span>
          <span>
            {warn ? (
              <b className="text-[#ff6b6b]">{warn}</b>
            ) : (
              <>
                elapsed <b className="text-[#ffcb6b]">{fmtTime(elapsed)}</b>
              </>
            )}
          </span>
        </div>

        <p
          className="text-base text-[#d6deeb] mb-5 leading-7"
          dangerouslySetInnerHTML={{ __html: q.q }}
        />

        <div className="grid gap-2.5">
          {q.opts.map((opt, i) => {
            const sel = answers[idx] === i;
            return (
              <button
                key={i}
                onClick={() => select(i)}
                className={`text-left px-3.5 py-3 rounded-md border flex gap-3 items-start transition ${
                  sel
                    ? "border-[#82aaff] bg-[#0e1622]"
                    : "border-[#1c2530] bg-[#0b1017] hover:border-[#82aaff]"
                }`}
              >
                <span className="text-[11px] text-[#8895a7] border border-[#1c2530] rounded px-1.5 py-0.5 min-w-[22px] text-center">
                  {String.fromCharCode(65 + i)}
                </span>
                <span dangerouslySetInnerHTML={{ __html: opt }} />
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleAbort}
            className="text-[#82aaff] text-xs hover:underline"
          >
            [ abort to dashboard ]
          </button>
          <div className="flex gap-2.5">
            <button
              onClick={goPrev}
              disabled={idx === 0}
              className="px-3.5 py-2 rounded-md border border-[#1c2530] text-[#d6deeb] hover:border-[#82aaff] hover:text-[#82aaff] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← prev
            </button>
            <button
              onClick={goNext}
              className="px-4 py-2 rounded-md bg-[#7fdbca] text-[#06222a] font-bold hover:brightness-110 active:translate-y-px transition"
            >
              {idx === total - 1 ? "submit ⏎" : "next →"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
