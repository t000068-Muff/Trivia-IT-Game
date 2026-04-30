"use client";

import { useEffect, useState } from "react";

/**
 * Persistent header: brand mark, current user pill, ticking clock,
 * optional logout link.
 */
export function TopBar({
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
          <button onClick={onLogout} className="text-[#82aaff] hover:underline">
            [ logout ]
          </button>
        )}
      </div>
    </div>
  );
}
