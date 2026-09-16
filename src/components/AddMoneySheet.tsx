import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { AmountField } from "@/components/AmountField";
import { useStore } from "@/lib/store";
import { fromISODate, periodTypeForDate, toISODate } from "@/lib/periods";
import type { PeriodType } from "@/lib/types";


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
  const [note, setNote] = useState("");
  const periodType: PeriodType = date ? periodTypeForDate(fromISODate(date)) : "weekday";

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setDate(toISODate(new Date()));
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
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-xl bg-card px-3 py-2.5 text-[13px] text-foreground ring-1 ring-hair outline-none"
              />
            </div>
            <div>
              <p className="label-mono text-mut">Period</p>
              <div className="mt-2 flex h-[42px] items-center justify-center rounded-xl bg-card ring-1 ring-hair">
                <span className="text-[12px] text-brasshi">
                  {periodType === "weekday" ? "Weekday" : "Weekend"}
                </span>
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
