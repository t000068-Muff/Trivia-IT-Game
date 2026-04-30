"use client";

import { useCallback, useEffect, useState } from "react";
import { Background } from "./components/Background";
import { TopBar } from "./components/TopBar";
import { LoginView } from "./components/LoginView";
import { Dashboard } from "./components/Dashboard";
import { Quiz } from "./components/Quiz";
import { Result } from "./components/Result";
import { QUESTIONS } from "./lib/questions";
import {
  clearSession,
  loadSession,
  loadUsers,
  saveSession,
  saveUsers,
} from "./lib/storage";
import type { Users, View } from "./lib/types";

/**
 * Top-level orchestrator. Holds the current view + session, owns the
 * quiz run state, and renders the right child component for the view.
 */
export default function TriviaPage() {
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("login");
  const [session, setSession] = useState<string | null>(null);
  const [users, setUsers] = useState<Users>({});

  // Quiz run state
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const s = loadSession();
    setSession(s);
    setUsers(loadUsers());
    setView(s ? "dashboard" : "login");
    setHydrated(true);
  }, []);

  const onLogin = useCallback((phone: string) => {
    const all = loadUsers();
    if (!all[phone]) all[phone] = { phone, attempts: [] };
    saveUsers(all);
    saveSession(phone);
    setUsers(all);
    setSession(phone);
    setView("dashboard");
  }, []);

  const onLogout = useCallback(() => {
    clearSession();
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

  // Avoid a hydration flash before localStorage is read.
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0a0e14] text-[#5b6b7d] font-mono grid place-items-center">
        <span>// booting…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#d6deeb] font-mono text-sm leading-6 relative overflow-x-hidden bg-[#0a0e14]">
      <Background />
      <div className="max-w-5xl mx-auto px-6 pt-7 pb-20 relative">
        <TopBar
          session={session}
          onLogout={onLogout}
          showLogout={view !== "login"}
        />
        {view === "login" && <LoginView onLogin={onLogin} />}
        {view === "dashboard" && session && (
          <Dashboard me={session} users={users} onPlay={startQuiz} />
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
