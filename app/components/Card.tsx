/**
 * Bordered card with a faux-window title bar (three traffic lights + caption).
 * Used as the main surface for every screen in the app.
 */
export function Card({
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

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs tracking-wider uppercase text-[#8895a7] mb-3">
      {children}
    </h2>
  );
}

export function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex justify-between text-[11px] tracking-widest uppercase text-[#8895a7] mb-1.5">
      <span>{label}</span>
      {hint && <span>{hint}</span>}
    </div>
  );
}

export function Stat({
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
