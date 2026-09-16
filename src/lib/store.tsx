import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppData, Category, Expense, MoneyAddition, PeriodType } from "./types";
import { DEFAULT_CATEGORIES, clearData, emptyData, loadData, saveData, uid } from "./storage";
import { toISODate } from "./periods";

interface StoreValue {
  data: AppData;
  ready: boolean;
  currency: string;
  completeOnboarding: (input: {
    name: string;
    weekdayBudget: number;
    weekendBudget: number;
  }) => void;
  addExpense: (input: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addMoney: (input: { amount: number; periodType: PeriodType; date: string; note?: string }) => void;
  deleteMoney: (id: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  updateProfile: (patch: { name?: string; currency?: string }) => void;
  setBudgets: (input: {
    weekdayBudget: number;
    weekendBudget: number;
    effectiveFrom: string;
  }) => void;
  replaceAll: (data: AppData) => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  const commit = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  const value = useMemo<StoreValue>(() => {
    const userId = data.user?.id ?? "local";
    const now = () => new Date().toISOString();

    return {
      data,
      ready,
      currency: data.user?.currency ?? "₹",
      completeOnboarding: ({ name, weekdayBudget, weekendBudget }) => {
        const id = uid();
        const created = now();
        commit({
          version: 1,
          user: {
            id,
            name,
            currency: "₹",
            createdAt: created,
            onboardingCompleted: true,
          },
          budgets: [
            {
              id: uid(),
              userId: id,
              weekdayBudget,
              weekendBudget,
              effectiveFrom: toISODate(new Date(new Date().getFullYear(), 0, 1)),
            },
          ],
          expenses: [],
          additions: [],
          categories: DEFAULT_CATEGORIES.map((c) => ({
            id: uid(),
            userId: id,
            name: c.name,
            icon: c.icon,
            createdAt: created,
          })),
        });
      },
      addExpense: (input) => {
        const expense: Expense = {
          ...input,
          id: uid(),
          userId,
          createdAt: now(),
          updatedAt: now(),
        };
        commit({ ...data, expenses: [expense, ...data.expenses] });
      },
      updateExpense: (id, patch) => {
        commit({
          ...data,
          expenses: data.expenses.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: now() } : e,
          ),
        });
      },
      deleteExpense: (id) => {
        commit({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
      },
      addMoney: (input) => {
        const addition: MoneyAddition = { ...input, id: uid(), userId, createdAt: now() };
        commit({ ...data, additions: [addition, ...data.additions] });
      },
      deleteMoney: (id) => {
        commit({ ...data, additions: data.additions.filter((a) => a.id !== id) });
      },
      addCategory: (name) => {
        const category: Category = {
          id: uid(),
          userId,
          name,
          icon: "circle-dashed",
          createdAt: now(),
        };
        commit({ ...data, categories: [...data.categories, category] });
      },
      deleteCategory: (id) => {
        commit({ ...data, categories: data.categories.filter((c) => c.id !== id) });
      },
      updateProfile: (patch) => {
        if (!data.user) return;
        commit({ ...data, user: { ...data.user, ...patch } });
      },
      setBudgets: ({ weekdayBudget, weekendBudget, effectiveFrom }) => {
        const existing = data.budgets.filter((b) => b.effectiveFrom !== effectiveFrom);
        commit({
          ...data,
          budgets: [
            ...existing,
            { id: uid(), userId, weekdayBudget, weekendBudget, effectiveFrom },
          ].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom)),
        });
      },
      replaceAll: (next) => commit({ ...emptyData, ...next }),
      resetAll: () => {
        clearData();
        setData(emptyData);
      },
    };
  }, [data, ready, commit]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
