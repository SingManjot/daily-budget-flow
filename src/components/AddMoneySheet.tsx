import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { AmountField } from "@/components/AmountField";
import { useStore } from "@/lib/store";
import { fromISODate, periodTypeForDate, toISODate } from "@/lib/periods";
import type { PeriodType } from "@/lib/types";
import { hapticSuccess } from "@/lib/native";

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
    hapticSuccess();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-hair bg-background">
        <div className="mx-auto w-full max-w-[420px] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-3">
          <DrawerTitle className="text-center text-[17px] font-semibold">Add Money</DrawerTitle>
          <p className="mt-1 text-center text-[13px] text-mut">
            Extra money for this period. Your budget stays the same.
          </p>

          <div className="mt-4">
            <AmountField value={amount} onChange={setAmount} currency={currency} autoFocus />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="label-section text-mut">Date</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl bg-card px-3 text-[16px] text-foreground ring-1 ring-hair outline-none"
              />
            </div>
            <div>
              <p className="label-section text-mut">Period</p>
              <div className="mt-2 flex h-11 items-center justify-center rounded-xl bg-muted">
                <span className="text-[15px] font-medium text-brasshi">
                  {periodType === "weekday" ? "Weekday" : "Weekend"}
                </span>
              </div>
            </div>
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="mt-4 h-12 w-full rounded-xl bg-card px-4 text-[16px] text-foreground ring-1 ring-hair outline-none placeholder:text-mut/70 focus:ring-brass/50"
          />

          <button
            onClick={save}
            className="pressable mt-6 h-[50px] w-full rounded-full bg-brass text-[17px] font-semibold text-background active:bg-brasshi"
          >
            Add Money
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
