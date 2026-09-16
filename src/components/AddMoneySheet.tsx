import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { AmountField } from "@/components/AmountField";
import { useStore } from "@/lib/store";
import { fromISODate, periodTypeForDate, toISODate } from "@/lib/periods";
import type { PeriodType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AddMoneySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addMoney, currency } = useStore();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));
  const [periodType, setPeriodType] = useState<PeriodType>(periodTypeForDate(new Date()));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setDate(toISODate(new Date()));
    setPeriodType(periodTypeForDate(new Date()));
    setNote("");
  }, [open]);

  const save = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter an amount");
      return;
    }
    addMoney({ amount: value, periodType, date, note });
    toast.success("Extra money added");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-hair bg-background">
        <div className="mx-auto w-full max-w-[420px] px-5 pb-8 pt-2">
          <DrawerTitle className="label-mono text-center text-mut">Add money</DrawerTitle>
          <p className="mt-1 text-center text-[12px] text-mut">
            Extra money for this period. Your budget stays the same.
          </p>

          <div className="mt-4">
            <AmountField value={amount} onChange={setAmount} currency={currency} autoFocus />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="label-mono text-mut">Date</p>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (e.target.value) setPeriodType(periodTypeForDate(fromISODate(e.target.value)));
                }}
                className="mt-2 w-full rounded-xl bg-card px-3 py-2.5 text-[13px] text-foreground ring-1 ring-hair outline-none"
              />
            </div>
            <div>
              <p className="label-mono text-mut">Period</p>
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-card p-1 ring-1 ring-hair">
                {(["weekday", "weekend"] as PeriodType[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodType(p)}
                    className={cn(
                      "rounded-lg py-1.5 text-[12px] transition-colors",
                      periodType === p ? "bg-brass/15 text-brasshi" : "text-mut",
                    )}
                  >
                    {p === "weekday" ? "Weekday" : "Weekend"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="mt-4 w-full rounded-xl bg-card px-3 py-3 text-[13px] text-foreground ring-1 ring-hair outline-none placeholder:text-mut/70"
          />

          <button
            onClick={save}
            className="mt-5 h-12 w-full rounded-xl bg-card text-[14px] font-medium text-foreground ring-1 ring-hair transition active:bg-accent"
          >
            Add money
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
