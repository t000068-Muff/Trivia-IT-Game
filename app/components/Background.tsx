/**
 * Decorative grid + ambient gradient layer for the terminal aesthetic.
 * Pure CSS, no client-side state.
 */
export function Background() {
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
