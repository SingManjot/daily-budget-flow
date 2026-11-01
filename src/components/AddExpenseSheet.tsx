import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { AmountField } from "@/components/AmountField";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Segmented } from "@/components/Segmented";
import { useStore } from "@/lib/store";
import { dateForPeriod, fromISODate, periodTypeForDate, toISODate } from "@/lib/periods";
import type { Expense, PeriodType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { hapticSuccess } from "@/lib/native";

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
    hapticSuccess();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-hair bg-background">
        <div className="mx-auto w-full max-w-[420px] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-3">
          <DrawerTitle className="text-center text-[17px] font-semibold">
            {editing ? "Edit Expense" : "New Expense"}
          </DrawerTitle>

          <div className="mt-4">
            <AmountField value={amount} onChange={setAmount} currency={currency} autoFocus />
          </div>

          <p className="label-section mt-5 text-mut">Category</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {data.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "pressable flex flex-col items-center gap-1.5 rounded-2xl py-3 ring-1",
                  categoryId === c.id ? "bg-brass/12 ring-brass/60" : "bg-card ring-hair",
                )}
              >
                <CategoryIcon
                  icon={c.icon}
                  className={cn("size-5", categoryId === c.id ? "text-brasshi" : "text-mut")}
                />
                <span
                  className={cn(
                    "truncate px-1 text-[13px]",
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
              <p className="label-section text-mut">Date</p>
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
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-xl bg-card px-3 text-left text-foreground ring-1 ring-hair"
                >
                  <span className="text-[15px]">
                    {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <CalendarDays className="size-4 text-mut" />
                </button>
              </div>
            </div>
            <div>
              <p className="label-section text-mut">Period</p>
              <Segmented
                label="Period"
                className="mt-2 h-11 [&>button]:h-full"
                value={periodType}
                onChange={applyPeriod}
                options={[
                  { value: "weekday", label: "Weekday" },
                  { value: "weekend", label: "Weekend" },
                ]}
              />
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
            className="mt-4 h-12 w-full rounded-xl bg-card px-4 text-[16px] text-foreground ring-1 ring-hair outline-none placeholder:text-mut/70 focus:ring-brass/50"
          />

          <button
            onClick={save}
            className="pressable mt-6 h-[50px] w-full rounded-full bg-brass text-[17px] font-semibold text-background active:bg-brasshi"
          >
            {editing ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
