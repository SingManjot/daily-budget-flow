import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { AmountField } from "@/components/AmountField";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useStore } from "@/lib/store";
import { periodTypeForDate, toISODate, fromISODate } from "@/lib/periods";
import type { Expense, PeriodType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AddExpenseSheet({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Expense | null;
}) {
  const { data, addExpense, updateExpense, currency } = useStore();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));
  const [note, setNote] = useState("");
  // Always derived from the chosen date — Mon–Fri is a weekday, Sat–Sun a weekend.
  const periodType: PeriodType = date ? periodTypeForDate(fromISODate(date)) : "weekday";

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setAmount(String(editing.amount));
      setCategoryId(editing.categoryId);
      setDate(editing.date);
      setNote(editing.note ?? "");
    } else {
      setAmount("");
      setCategoryId(data.categories[0]?.id ?? "");
      setDate(toISODate(new Date()));
      setNote("");
    }
  }, [open, editing, data.categories]);

  const save = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter an amount");
      return;
    }
    if (!categoryId) {
      toast.error("Pick a category");
      return;
    }
    if (editing) {
      updateExpense(editing.id, { amount: value, categoryId, date, periodType, note });
      toast.success("Expense updated");
    } else {
      addExpense({ amount: value, categoryId, date, periodType, note });
      toast.success("Expense added");
    }
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-hair bg-background">
        <div className="mx-auto w-full max-w-[420px] px-5 pb-8 pt-2">
          <DrawerTitle className="label-mono text-center text-mut">
            {editing ? "Edit expense" : "New expense"}
          </DrawerTitle>

          <div className="mt-4">
            <AmountField value={amount} onChange={setAmount} currency={currency} autoFocus />
          </div>

          <p className="label-mono mt-5 text-mut">Category</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {data.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl bg-card py-3 ring-1 transition-colors active:scale-[0.98]",
                  categoryId === c.id ? "ring-brass/50" : "ring-hair",
                )}
              >
                <CategoryIcon
                  icon={c.icon}
                  className={cn("size-4", categoryId === c.id ? "text-brasshi" : "text-mut")}
                />
                <span
                  className={cn(
                    "truncate px-1 text-[11px]",
                    categoryId === c.id ? "text-foreground" : "text-mut",
                  )}
                >
                  {c.name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="label-mono text-mut">Date</p>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (!periodTouched && e.target.value) {
                    setPeriodType(periodTypeForDate(fromISODate(e.target.value)));
                  }
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
                    onClick={() => {
                      setPeriodType(p);
                      setPeriodTouched(true);
                    }}
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
            className="mt-5 h-12 w-full rounded-xl bg-brass text-[14px] font-semibold text-background ring-1 ring-brasshi/40 transition active:bg-brasshi"
          >
            {editing ? "Save changes" : "Add expense"}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
