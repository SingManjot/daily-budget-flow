import { kv } from "./kv";
import type { AppData } from "./types";

// Same key as the old web app, so exported JSON backups import unchanged.

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
  try {
    const raw = kv.get(KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as AppData;
    return { ...emptyData, ...parsed };
  } catch {
    return emptyData;
  }
}

export function saveData(data: AppData): void {
  kv.set(KEY, JSON.stringify(data));
}

export function clearData(): void {
  kv.remove(KEY);
}
