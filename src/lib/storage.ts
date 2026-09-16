import type { AppData } from "./types";

const KEY = "spend-tracker:v1";

export const emptyData: AppData = {
  version: 1,
  user: null,
  budgets: [],
  expenses: [],
  additions: [],
  categories: [],
};

export const DEFAULT_CATEGORIES: { name: string; icon: string }[] = [
  { name: "Food", icon: "utensils" },
  { name: "Shopping", icon: "shopping-bag" },
  { name: "Transport", icon: "car" },
  { name: "Entertainment", icon: "clapperboard" },
  { name: "Bills", icon: "receipt" },
  { name: "Other", icon: "circle-dashed" },
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function loadData(): AppData {
  if (typeof window === "undefined") return emptyData;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as AppData;
    return { ...emptyData, ...parsed };
  } catch {
    return emptyData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
