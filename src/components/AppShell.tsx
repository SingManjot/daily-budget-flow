import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { AddMoneySheet } from "@/components/AddMoneySheet";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home" },
  { to: "/history", label: "History" },
  { to: "/overview", label: "Overview" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [moneyOpen, setMoneyOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[420px] flex-col">
      <main className="flex-1 pb-4">{children}</main>

      <div className="sticky bottom-0 z-20 bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex gap-3 px-6 pb-3 pt-4">
          <button
            onClick={() => setExpenseOpen(true)}
            className="h-12 flex-1 rounded-xl bg-brass text-[14px] font-semibold text-background ring-1 ring-brasshi/40 transition active:bg-brasshi"
          >
            + Expense
          </button>
          <button
            onClick={() => setMoneyOpen(true)}
            className="h-12 rounded-xl bg-card px-5 text-[13px] font-medium text-foreground/80 ring-1 ring-hair transition active:bg-accent"
          >
            + Money
          </button>
        </div>

        <nav className="safe-bottom border-t border-hair px-2 pt-3">
          <div className="grid grid-cols-4 text-center">
            {TABS.map((t) => {
              const active = pathname === t.to;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="flex flex-col items-center gap-1 py-1"
                >
                  <span
                    className={cn("font-mono text-[10px]", active ? "text-brasshi" : "text-mut")}
                  >
                    {t.label}
                  </span>
                  <span
                    className={cn(
                      "size-1 rounded-full",
                      active ? "bg-brasshi" : "bg-transparent",
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <AddExpenseSheet open={expenseOpen} onOpenChange={setExpenseOpen} />
      <AddMoneySheet open={moneyOpen} onOpenChange={setMoneyOpen} />
    </div>
  );
}
