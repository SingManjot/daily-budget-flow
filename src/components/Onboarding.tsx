import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import { AmountField } from "@/components/AmountField";
import { cn } from "@/lib/utils";

export function Onboarding() {
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [weekday, setWeekday] = useState("");
  const [weekend, setWeekend] = useState("");

  const next = () => setStep((s) => s + 1);

  const steps = [
    // 0 — welcome
    <div key="welcome" className="anim-rise flex flex-1 flex-col justify-end">
      <h1 className="font-display text-[52px] italic leading-[1.05] text-brasshi">Spend smarter.</h1>
      <p className="mt-5 max-w-[19rem] text-[15px] leading-relaxed text-mut">
        Know what you can spend.
        <br />
        See what you actually spent.
        <br />
        Know whether you&apos;re ahead or behind.
      </p>
    </div>,
    // 1 — name
    <div key="name" className="anim-rise flex flex-1 flex-col justify-end">
      <p className="label-mono text-mut">Step 1 of 3</p>
      <h1 className="mt-2 text-[26px] font-medium leading-tight">What should we call you?</h1>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="mt-6 w-full rounded-2xl bg-card px-4 py-4 text-[17px] text-foreground ring-1 ring-hair outline-none placeholder:text-mut/70 focus:ring-brass/40"
      />
    </div>,
    // 2 — weekday
    <div key="weekday" className="anim-rise flex flex-1 flex-col justify-end">
      <p className="label-mono text-mut">Step 2 of 3</p>
      <h1 className="mt-2 text-[26px] font-medium leading-tight">Set your weekday budget</h1>
      <p className="mt-2 text-[14px] text-mut">How much can you spend from Monday to Friday?</p>
      <div className="mt-6">
        <AmountField value={weekday} onChange={setWeekday} />
      </div>
    </div>,
    // 3 — weekend
    <div key="weekend" className="anim-rise flex flex-1 flex-col justify-end">
      <p className="label-mono text-mut">Step 3 of 3</p>
      <h1 className="mt-2 text-[26px] font-medium leading-tight">Set your weekend budget</h1>
      <p className="mt-2 text-[14px] text-mut">How much can you spend on Saturday and Sunday?</p>
      <div className="mt-6">
        <AmountField value={weekend} onChange={setWeekend} />
      </div>
    </div>,
    // 4 — confirm
    <div key="done" className="anim-rise flex flex-1 flex-col justify-end">
      <h1 className="font-display text-[44px] italic leading-none text-brasshi">
        You&apos;re all set ✨
      </h1>
      <div className="mt-7 space-y-3">
        <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-4 ring-1 ring-hair">
          <span className="label-mono text-mut">Mon – Fri</span>
          <span className="font-mono text-[17px]">{formatMoney(Number(weekday) || 0)}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-4 ring-1 ring-hair">
          <span className="label-mono text-mut">Sat – Sun</span>
          <span className="font-mono text-[17px]">{formatMoney(Number(weekend) || 0)}</span>
        </div>
      </div>
      <p className="mt-4 text-[13px] text-mut">
        Your weekday and weekend budgets are tracked separately.
      </p>
    </div>,
  ];

  const labels = ["Get started", "Continue", "Continue", "Continue", "Start tracking"];
  const canContinue =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && Number(weekday) > 0) ||
    (step === 3 && Number(weekend) > 0) ||
    step === 0 ||
    step === 4;

  const onPress = () => {
    if (step === 4) {
      completeOnboarding({
        name: name.trim(),
        weekdayBudget: Number(weekday),
        weekendBudget: Number(weekend),
      });
      return;
    }
    next();
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[420px] flex-col px-6 pb-8 pt-16">
      {steps[step]}
      <div className="mt-10">
        <div className="mb-5 flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[2px] flex-1 rounded-full transition-colors",
                i <= step ? "bg-brass" : "bg-hair",
              )}
            />
          ))}
        </div>
        <button
          disabled={!canContinue}
          onClick={onPress}
          className="h-13 w-full rounded-xl bg-brass py-4 text-[14px] font-semibold text-background ring-1 ring-brasshi/40 transition active:bg-brasshi disabled:opacity-40"
        >
          {labels[step]}
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mt-3 h-10 w-full text-[13px] text-mut"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
