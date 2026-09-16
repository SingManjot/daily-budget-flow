export function AmountField({
  value,
  onChange,
  currency = "₹",
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  currency?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-center gap-2 rounded-2xl bg-card px-4 py-6 ring-1 ring-hair">
      <span className="text-[24px] text-mut">{currency}</span>
      <input
        autoFocus={autoFocus}
        inputMode="decimal"
        value={value}
        placeholder="0"
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        className="w-full max-w-[200px] bg-transparent text-center font-mono text-[34px] leading-none text-foreground outline-none placeholder:text-hair"
      />
    </div>
  );
}
