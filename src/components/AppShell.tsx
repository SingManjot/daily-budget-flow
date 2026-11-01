import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChartPie,
  House,
  Plus,
  ReceiptText,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { AddMoneySheet } from "@/components/AddMoneySheet";
import { cn } from "@/lib/utils";
import { hapticTap } from "@/lib/native";
import { useSmsSync } from "@/lib/sms/use-sms-sync";

const TABS: {
  to: "/" | "/history" | "/overview" | "/settings";
  label: string;
  icon: LucideIcon;
}[] = [
  { to: "/", label: "Home", icon: House },
  { to: "/history", label: "History", icon: ReceiptText },
  { to: "/overview", label: "Overview", icon: ChartPie },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [moneyOpen, setMoneyOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useSmsSync();

  return (
    <div className="mx-auto flex min-h-[var(--app-height)] w-full max-w-[420px] flex-col pt-[env(safe-area-inset-top)]">
      {/* Bottom padding keeps the last card clear of the floating bars. */}
      <main className="flex-1 pb-40">{children}</main>

      <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[420px] bg-gradient-to-t from-background via-background/85 to-transparent px-4 pt-8">
        {/* Actions on the current context: kept out of the tab bar (tabs navigate, they don't act). */}
        <div className="pointer-events-auto flex gap-2.5">
          <button
            onClick={() => {
              hapticTap();
              setExpenseOpen(true);
            }}
            className="pressable flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-brass text-[16px] font-semibold text-background shadow-lg shadow-black/25 active:bg-brasshi"
          >
            <Plus className="size-5" strokeWidth={2.25} />
            Add Expense
          </button>
          <button
            onClick={() => {
              hapticTap();
              setMoneyOpen(true);
            }}
            className="pressable glass flex h-12 items-center justify-center gap-1.5 rounded-full px-5 text-[15px] font-medium text-foreground"
          >
            <Wallet className="size-[18px] text-brasshi" strokeWidth={1.75} />
            Money
          </button>
        </div>

        <nav
          aria-label="Main"
          className="glass pointer-events-auto mt-2.5 grid grid-cols-4 rounded-full p-1"
        >
          {TABS.map((t) => {
            const active =
              pathname === t.to || (t.to === "/history" && pathname.startsWith("/month"));
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-full transition-colors duration-200",
                  active ? "bg-foreground/[0.08] text-brasshi" : "text-mut active:text-foreground",
                )}
              >
                <Icon
                  className="size-[22px]"
                  strokeWidth={active ? 2.1 : 1.6}
                  fill={active ? "currentColor" : "none"}
                  fillOpacity={active ? 0.18 : 0}
                />
                <span className="text-[11px] font-medium leading-none">{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <AddExpenseSheet open={expenseOpen} onOpenChange={setExpenseOpen} />
      <AddMoneySheet open={moneyOpen} onOpenChange={setMoneyOpen} />
    </div>
  );
}
