"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS } from "./questions";

/* ============================================================
   Storage / types
   ============================================================ */
type Attempt = { score: number; total: number; timeSec: number; ts: number };
type User = { phone: string; attempts: Attempt[] };
type Users = Record<string, User>;

const LS_USERS = "it_trivia.users";
const LS_SESSION = "it_trivia.session";

const loadUsers = (): Users => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_USERS) || "{}") as Users;
  } catch {
    return {};
  }
};
const saveUsers = (u: Users) => localStorage.setItem(LS_USERS, JSON.stringify(u));
const loadSession = (): string | null =>
  typeof window === "undefined" ? null : localStorage.getItem(LS_SESSION);

/* ============================================================
   Helpers
   ============================================================ */
const isPhone = (s: string) => /^\+?[0-9 \-]{7,16}$/.test(s.trim());
const genOTP = () => String(Math.floor(100000 + Math.random() * 900000));
const fmtTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (m ? m + "m " : "") + s + "s";
};

/* ============================================================
   Page
   ============================================================ */
type View = "login" | "dashboard" | "quiz" | "result";

export default function TriviaPage() {
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("login");
  const [session, setSession] = useState<string | null>(null);
  const [users, setUsers] = useState<Users>({});

  // quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalTime, setFinalTime] = useState<number>(0);

  // Hydrate from localStorage
  useEffect(() => {
    const s = loadSession();
    setSession(s);
    setUsers(loadUsers());
    setView(s ? "dashboard" : "login");
    setHydrated(true);
  }, []);

  const refreshUsers = useCallback(() => setUsers(loadUsers()), []);

  const onLogin = useCallback((phone: string) => {
    const all = loadUsers();
    if (!all[phone]) all[phone] = { phone, attempts: [] };
    saveUsers(all);
    localStorage.setItem(LS_SESSION, phone);
    setUsers(all);
    setSession(phone);
    setView("dashboard");
  }, []);

  const onLogout = useCallback(() => {
    localStorage.removeItem(LS_SESSION);
    setSession(null);
    setView("login");
  }, []);

  const startQuiz = useCallback(() => {
    setQuizIdx(0);
    setAnswers(new Array(QUESTIONS.length).fill(null));
    setStartedAt(Date.now());
    setView("quiz");
  }, []);

  const finishQuiz = useCallback(
    (finalAnswers: (number | null)[]) => {
      let score = 0;
      finalAnswers.forEach((ans, i) => {
        if (ans === QUESTIONS[i].a) score++;
      });
      const timeSec = Math.floor((Date.now() - startedAt) / 1000);
      setFinalScore(score);
      setFinalTime(timeSec);

      if (session) {
        const all = loadUsers();
        if (!all[session]) all[session] = { phone: session, attempts: [] };
        all[session].attempts.push({
          score,
          total: QUESTIONS.length,
          timeSec,
          ts: Date.now(),
        });
        saveUsers(all);
        setUsers(all);
      }
      setView("result");
    },
    [session, startedAt],
  );

  // Avoid hydration flash
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0a0e14] text-[#5b6b7d] font-mono grid place-items-center">
        <span>// booting…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#d6deeb] font-mono text-sm leading-6 relative overflow-x-hidden bg-[#0a0e14]">
      <BackgroundDecor />
      <div className="max-w-5xl mx-auto px-6 pt-7 pb-20 relative">
        <TopBar
          session={session}
          onLogout={onLogout}
          showLogout={view !== "login"}
        />
        {view === "login" && <LoginView onLogin={onLogin} />}
        {view === "dashboard" && session && (
          <Dashboard
            me={session}
            users={users}
            onPlay={startQuiz}
            onRefresh={refreshUsers}
          />
        )}
        {view === "quiz" && (
          <Quiz
            idx={quizIdx}
            setIdx={setQuizIdx}
            answers={answers}
            setAnswers={setAnswers}
            startedAt={startedAt}
            onFinish={finishQuiz}
            onAbort={() => setView("dashboard")}
          />
        )}
        {view === "result" && (
          <Result
            score={finalScore}
            timeSec={finalTime}
            answers={answers}
            onAgain={startQuiz}
            onBack={() => setView("dashboard")}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Background decoration (grid + ambient)
   ============================================================ */
function BackgroundDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 80% -10%, rgba(127,219,202,.06), transparent 60%), radial-gradient(900px 500px at -10% 100%, rgba(130,170,255,.06), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[.18]"
        style={{
          backgroundImage:
            "linear-gradient(#1c2530 1px, transparent 1px), linear-gradient(90deg, #1c2530 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, #000 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, #000 30%, transparent 80%)",
        }}
      />
    </>
  );
}

/* ============================================================
   Top bar
   ============================================================ */
function TopBar({
  session,
  onLogout,
  showLogout,
}: {
  session: string | null;
  onLogout: () => void;
  showLogout: boolean;
}) {
  const [now, setNow] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setNow(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between pb-3.5 mb-6 border-b border-[#1c2530]">
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-[#7fdbca] shadow-[0_0_12px_#7fdbca]" />
        <b className="text-[#d6deeb] tracking-wider">IT_TRIVIA</b>
        <span className="text-[#5b6b7d]">// v1.0</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-[#5b6b7d]">
        {session && (
          <span className="px-2 py-0.5 rounded-full border border-[#1c2530] bg-[#0b1017] text-[#8895a7]">
            user: {session}
          </span>
        )}
        <span>{now}</span>
        {showLogout && session && (
          <button
            onClick={onLogout}
            className="text-[#82aaff] hover:underline"
          >
            [ logout ]
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Card primitive
   ============================================================ */
function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[#1c2530] overflow-hidden ${className}`}
      style={{ background: "linear-gradient(180deg, #0f141b, #0c1118)" }}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1c2530] bg-[#0b1017] text-xs tracking-wider text-[#8895a7]">
        <div className="flex gap-1.5">
          <i className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]/40 inline-block" />
          <i className="w-2.5 h-2.5 rounded-full bg-[#ffcb6b]/40 inline-block" />
          <i className="w-2.5 h-2.5 rounded-full bg-[#9ece6a]/40 inline-block" />
        </div>
        <span>{title}</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/* ============================================================
   Login (phone + OTP)
   ============================================================ */
function LoginView({ onLogin }: { onLogin: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [err1, setErr1] = useState("");
  const [err2, setErr2] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  const sendOtp = () => {
    setErr1("");
    if (!isPhone(phone)) {
      setErr1("× invalid phone number format");
      return;
    }
    const code = genOTP();
    setPendingOtp(code);
    setPendingPhone(phone.trim());
    setOtp("");
    setTimeout(() => otpInputRef.current?.focus(), 0);
  };

  const verify = () => {
    setErr2("");
    if (!pendingOtp || !pendingPhone) {
      setErr2("× session expired, restart");
      return;
    }
    if (otp.trim() !== pendingOtp) {
      setErr2("× incorrect code");
      return;
    }
    onLogin(pendingPhone);
  };

  const reset = () => {
    setPendingOtp(null);
    setPendingPhone(null);
    setErr2("");
  };

  const resend = () => {
    if (!pendingPhone) return;
    setPendingOtp(genOTP());
  };

  return (
    <div className="min-h-[calc(100vh-90px)] grid place-items-center">
      <div className="w-full max-w-md">
        <Card title="~/auth/login.sh">
          <h1 className="text-base font-semibold tracking-wide flex items-center">
            $ authenticate
            <span
              className="inline-block w-2 h-3.5 bg-[#7fdbca] ml-1.5 translate-y-0.5"
              style={{ animation: "blink 1s steps(1) infinite" }}
            />
            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
          </h1>
          <p className="text-xs text-[#5b6b7d] mt-1.5 mb-5">
            // enter your phone number to receive a one-time code.
          </p>

          {!pendingOtp ? (
            <>
              <FieldLabel label="phone_number" hint="required" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                placeholder="+1 555 0123"
                autoComplete="tel"
                className="w-full rounded-md bg-[#080c12] border border-[#1c2530] px-3 py-2.5 outline-none text-[#d6deeb] focus:border-[#82aaff] focus:ring-2 focus:ring-[#82aaff]/20 transition"
              />
              <div className="flex flex-wrap gap-2.5 items-center mt-4">
                <button
                  onClick={sendOtp}
                  className="px-4 py-2.5 rounded-md bg-[#7fdbca] text-[#06222a] font-bold hover:brightness-110 active:translate-y-px transition"
                >
                  → send_otp()
                </button>
                <span className="px-2 py-0.5 rounded-full border border-[#1c2530] bg-[#0b1017] text-[#8895a7] text-xs">
                  demo: OTP shown on screen
                </span>
              </div>
              <div className="text-[#ff6b6b] text-xs mt-3 min-h-[1em]">{err1}</div>
            </>
          ) : (
            <>
              <FieldLabel label="otp_code" hint="6 digits" />
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && verify()}
                placeholder="••••••"
                className="w-full rounded-md bg-[#080c12] border border-[#1c2530] px-3 py-2.5 outline-none text-[#d6deeb] focus:border-[#82aaff] focus:ring-2 focus:ring-[#82aaff]/20 transition tracking-widest"
              />
              <div className="mt-3 px-3 py-2.5 border border-dashed border-[#1c2530] rounded-md bg-[#0a1118] text-[#8895a7] text-xs">
                // SMS gateway not configured in demo.
                <br />
                your one-time code:{" "}
                <b className="text-[#ffcb6b] tracking-[0.25em] text-sm">
                  {pendingOtp}
                </b>
              </div>
              <div className="flex flex-wrap gap-3 items-center mt-4">
                <button
                  onClick={verify}
                  className="px-4 py-2.5 rounded-md bg-[#7fdbca] text-[#06222a] font-bold hover:brightness-110 active:translate-y-px transition"
                >
                  → verify()
                </button>
                <button
                  onClick={reset}
                  className="text-[#82aaff] text-xs hover:underline"
                >
                  [ change number ]
                </button>
                <button
                  onClick={resend}
                  className="text-[#82aaff] text-xs hover:underline"
                >
                  [ resend ]
                </button>
              </div>
              <div className="text-[#ff6b6b] text-xs mt-3 min-h-[1em]">{err2}</div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex justify-between text-[11px] tracking-widest uppercase text-[#8895a7] mb-1.5">
      <span>{label}</span>
      {hint && <span>{hint}</span>}
    </div>
  );
}

/* ============================================================
   Dashboard
   ============================================================ */
type Row = {
  phone: string;
  bestScore: number | null;
  total: number;
  attempts: number;
  bestTime: number | null;
  lastTs: number;
};

function leaderboard(users: Users): Row[] {
  const rows: Row[] = Object.values(users).map((u) => {
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

function Dashboard({
  me,
  users,
  onPlay,
}: {
  me: string;
  users: Users;
  onPlay: () => void;
  onRefresh: () => void;
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
          <Stat k="top_score" v={`${topScore}/${QUESTIONS.length}`} accent="acc" />
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
                        <span className={`inline-block min-w-[22px] ${rankColor}`}>
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

function Stat({
  k,
  v,
  accent,
}: {
  k: string;
  v: string;
  accent?: "acc" | "acc2" | "warn";
}) {
  const color =
    accent === "acc"
      ? "text-[#7fdbca]"
      : accent === "acc2"
        ? "text-[#82aaff]"
        : accent === "warn"
          ? "text-[#ffcb6b]"
          : "text-[#d6deeb]";
  return (
    <div className="rounded-lg border border-[#1c2530] bg-[#0f141b] p-3.5">
      <div className="text-[11px] uppercase tracking-wider text-[#5b6b7d]">
        {k}
      </div>
      <div className={`text-2xl font-semibold mt-1.5 ${color}`}>{v}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs tracking-wider uppercase text-[#8895a7] mb-3">
      {children}
    </h2>
  );
}

/* ============================================================
   Quiz
   ============================================================ */
function Quiz({
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
    const tick = () =>
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
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

  // keyboard shortcuts
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

/* ============================================================
   Result
   ============================================================ */
function Result({
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
