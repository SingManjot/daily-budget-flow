import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppData, Category, Expense, MoneyAddition, PeriodType } from "./types";
import type { RawSms } from "./sms/parser";
import { merchantKey } from "./sms/parser";
import { buildPending, defaultSmsImport, markSeen } from "./sms/ingest";
import { DEFAULT_CATEGORIES, clearData, emptyData, loadData, saveData, uid } from "./storage";
import { fromISODate, periodTypeForDate, toISODate } from "./periods";

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
  addMoney: (input: {
    amount: number;
    periodType: PeriodType;
    date: string;
    note?: string;
  }) => void;
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
  /** Parse captured SMS into the review queue. Returns how many new items were queued. */
  ingestSms: (messages: RawSms[]) => number;
  confirmPending: (
    id: string,
    input: { categoryId: string; amount: number; date: string; note?: string },
  ) => void;
  dismissPending: (id: string) => void;
  setSmsEnabled: (enabled: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  /** Latest committed data, for async callers that need a synchronous read. */
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  const commit = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  /** Functional variant for async callers (SMS sync) that may hold a stale `data`. */
  const commitWith = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = fn(prev);
      if (next !== prev) saveData(next);
      return next;
    });
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
      ingestSms: (messages) => {
        const fresh = buildPending(messages, dataRef.current, uid);
        commitWith((prev) => {
          // Re-check against prev in case another sync landed in between.
          const taken = new Set([
            ...(prev.smsImport?.seen ?? []),
            ...(prev.pending ?? []).map((p) => p.fingerprint),
          ]);
          const toAdd = fresh.filter((p) => !taken.has(p.fingerprint));
          const smsImport = { ...(prev.smsImport ?? defaultSmsImport()), lastSyncAt: now() };
          return { ...prev, smsImport, pending: [...toAdd, ...(prev.pending ?? [])] };
        });
        return fresh.length;
      },
      confirmPending: (id, input) => {
        commitWith((prev) => {
          const item = prev.pending?.find((p) => p.id === id);
          if (!item) return prev;
          const state = prev.smsImport ?? defaultSmsImport();
          const expense: Expense = {
            id: uid(),
            userId: prev.user?.id ?? "local",
            amount: input.amount,
            categoryId: input.categoryId,
            date: input.date,
            periodType: periodTypeForDate(fromISODate(input.date)),
            note: input.note ?? item.merchant ?? "",
            source: "sms",
            createdAt: now(),
            updatedAt: now(),
          };
          const merchantCategories = item.merchant
            ? { ...state.merchantCategories, [merchantKey(item.merchant)]: input.categoryId }
            : state.merchantCategories;
          return {
            ...prev,
            expenses: [expense, ...prev.expenses],
            pending: (prev.pending ?? []).filter((p) => p.id !== id),
            smsImport: {
              ...state,
              seen: markSeen(state.seen, item.fingerprint),
              merchantCategories,
            },
          };
        });
      },
      dismissPending: (id) => {
        commitWith((prev) => {
          const item = prev.pending?.find((p) => p.id === id);
          if (!item) return prev;
          const state = prev.smsImport ?? defaultSmsImport();
          return {
            ...prev,
            pending: (prev.pending ?? []).filter((p) => p.id !== id),
            smsImport: { ...state, seen: markSeen(state.seen, item.fingerprint) },
          };
        });
      },
      setSmsEnabled: (enabled) => {
        commitWith((prev) => ({
          ...prev,
          smsImport: { ...(prev.smsImport ?? defaultSmsImport()), enabled },
        }));
      },
    };
  }, [data, ready, commit, commitWith]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
