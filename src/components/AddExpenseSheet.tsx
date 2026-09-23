import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { AmountField } from "@/components/AmountField";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useStore } from "@/lib/store";
import { dateForPeriod, fromISODate, periodTypeForDate, toISODate } from "@/lib/periods";
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
  const [periodType, setPeriodType] = useState<PeriodType>("weekday");
  const [note, setNote] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const applyPeriod = (nextPeriod: PeriodType) => {
    setPeriodType(nextPeriod);
    setDate(toISODate(dateForPeriod(nextPeriod, new Date())));
  };

  const openDatePicker = () => {
    if (!dateInputRef.current) return;
    if (typeof dateInputRef.current.showPicker === "function") {
      dateInputRef.current.showPicker();
      return;
    }
    dateInputRef.current.click();
  };

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setAmount(String(editing.amount));
      setCategoryId(editing.categoryId);
      setDate(editing.date);
      setPeriodType(periodTypeForDate(fromISODate(editing.date)));
      setNote(editing.note ?? "");
    } else {
      setAmount("");
      setCategoryId(data.categories[0]?.id ?? "");
      setDate(toISODate(dateForPeriod("weekday", new Date())));
      setPeriodType("weekday");
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
              <div className="relative mt-2">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setPeriodType(periodTypeForDate(fromISODate(e.target.value)));
                  }}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="flex w-full items-center justify-between gap-2 rounded-xl bg-card px-3 py-2.5 text-left ring-1 ring-hair text-foreground"
                >
                  <span className="text-[13px]">{new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  <CalendarDays className="size-4 text-mut" />
                </button>
              </div>
            </div>
            <div>
              <p className="label-mono text-mut">Period</p>
              <div className="mt-2 grid h-[42px] grid-cols-2 overflow-hidden rounded-xl bg-card ring-1 ring-hair">
                {(["weekday", "weekend"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => applyPeriod(option)}
                    className={cn(
                      "text-[12px] transition-colors",
                      periodType === option ? "bg-brass text-background" : "text-brasshi",
                    )}
                  >
                    {option === "weekday" ? "Weekday" : "Weekend"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onFocus={(e) => {
              const input = e.currentTarget;
              window.requestAnimationFrame(() => {
                input.scrollIntoView({ block: "center", behavior: "smooth" });
              });
            }}
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
