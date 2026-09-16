/**
 * Brass gauge: needle sits left of centre when under plan, right when over.
 * ratio = spent / planned (0 = nothing spent, 1 = exactly on plan).
 */
export function Gauge({ ratio }: { ratio: number }) {
  const clamped = Math.max(0, Math.min(2, Number.isFinite(ratio) ? ratio : 0));
  const angle = (clamped - 1) * 34; // -34deg .. +34deg
  const fill = Math.min(100, clamped * 50);

  return (
    <div className="relative h-16 overflow-hidden rounded-2xl bg-card ring-1 ring-hair">
      <div className="absolute inset-x-5 top-0 h-px bg-hair" />
      <div className="absolute inset-x-0 top-0 flex h-[52px] items-start justify-between px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="h-2.5 w-px bg-hair" />
        ))}
      </div>
      <div className="absolute inset-x-5 top-[26px] h-px bg-hair/60" />
      <div
        className="anim-bar absolute left-5 top-[26px] h-px bg-brass/50"
        style={{ width: `calc((100% - 2.5rem) * ${fill / 100})` }}
      />
      <div className="absolute left-1/2 top-[16px] -translate-x-1/2">
        <div
          className="h-[30px] w-[2px] origin-bottom bg-brasshi transition-transform duration-700"
          style={{ transform: `rotate(${angle}deg)` }}
        />
        <div className="mx-auto -mt-[3px] size-1.5 rounded-full bg-brasshi" />
      </div>
      <span className="label-mono absolute bottom-2 left-5 text-[10px] text-mut">Under</span>
      <span className="label-mono absolute bottom-2 right-5 text-[10px] text-mut">Over</span>
    </div>
  );
}
