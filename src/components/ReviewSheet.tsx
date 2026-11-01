import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { CategoryBadge } from "@/components/CategoryIcon";
import { useStore } from "@/lib/store";
import { relativeDay } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { hapticSuccess, hapticTap } from "@/lib/native";
import type { PendingExpense } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Bank-SMS transactions waiting for review: pick a category, then Add or Dismiss. */
export function ReviewSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data } = useStore();
  const pending = data.pending ?? [];

  // Close once the last item is handled.
  useEffect(() => {
    if (open && pending.length === 0) onOpenChange(false);
  }, [open, pending.length, onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-hair bg-background">
        <div className="mx-auto w-full max-w-[420px] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-3">
          <DrawerTitle className="text-center text-[17px] font-semibold">
            Review Transactions
          </DrawerTitle>
          <p className="mt-1 text-center text-[13px] text-mut">
            Read from your bank SMS. Pick a category to add each one.
          </p>
          <div className="mt-5 space-y-3">
            {pending.map((p) => (
              <ReviewItem key={p.id} item={p} />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ReviewItem({ item }: { item: PendingExpense }) {
  const { data, currency, confirmPending, dismissPending } = useStore();
  const [categoryId, setCategoryId] = useState(item.suggestedCategoryId ?? "");
  const category = data.categories.find((c) => c.id === categoryId);

  const add = () => {
    if (!categoryId) {
      toast.error("Pick a category");
      return;
    }
    confirmPending(item.id, {
      categoryId,
      amount: item.amount,
      date: item.date,
      note: item.merchant ?? "",
    });
    hapticSuccess();
    toast.success("Expense added");
  };

  return (
    <div className="anim-rise rounded-2xl bg-card p-4 ring-1 ring-hair">
      <div className="flex items-center gap-3">
        <CategoryBadge icon={category?.icon} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium">{item.merchant ?? "Unknown payee"}</p>
          <p className="truncate text-[13px] text-mut">
            {relativeDay(item.date)}
            {item.account ? ` · A/c ••${item.account}` : ""}
            {item.sender ? ` · ${item.sender}` : ""}
          </p>
        </div>
        <span className="shrink-0 text-[17px] font-semibold">
          {formatMoney(item.amount, currency)}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Category"
        className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {data.categories.map((c) => {
          const selected = c.id === categoryId;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                hapticTap();
                setCategoryId(c.id);
              }}
              className={cn(
                "h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium ring-1 transition-colors",
                selected ? "bg-brass/15 text-brasshi ring-brass/50" : "text-mut ring-hair",
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <details className="mt-2 text-[13px] text-mut">
        <summary className="cursor-pointer py-1.5">Show message</summary>
        <p className="mt-1 whitespace-pre-line break-words rounded-xl bg-muted p-3 text-[12px] leading-relaxed">
          {item.sender ? `${item.sender}\n` : ""}
          {item.body}
        </p>
      </details>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => dismissPending(item.id)}
          className="pressable h-11 flex-1 rounded-full text-[15px] font-medium text-mut ring-1 ring-hair"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={add}
          disabled={!categoryId}
          className="pressable h-11 flex-[2] rounded-full bg-brass text-[15px] font-semibold text-background active:bg-brasshi disabled:opacity-40"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}
