import type {
  AppData,
  BudgetSettings,
  Expense,
  MoneyAddition,
  PeriodType,
} from "./types";
import {
  daysOfMonth,
  fromISODate,
  monthKeyOf,
  periodContains,
  periodsInMonth,
  periodTypeForDate,
  toISODate,
  weekPeriods,
  type PeriodRange,
} from "./periods";

/** Budget settings in effect on a given date (never retroactive). */
export function budgetOn(budgets: BudgetSettings[], dateISO: string): BudgetSettings | null {
  const applicable = budgets
    .filter((b) => b.effectiveFrom <= dateISO)
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  if (applicable.length) return applicable[applicable.length - 1] ?? null;
  // Before any change took effect, fall back to the earliest known settings.
  const all = [...budgets].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  return all[0] ?? null;
}

export function budgetForPeriod(budgets: BudgetSettings[], p: PeriodRange): number {
  const b = budgetOn(budgets, toISODate(p.start));
  if (!b) return 0;
  return p.type === "weekday" ? b.weekdayBudget : b.weekendBudget;
}

/** Planned budget attributable to a single calendar day (used for partial months). */
export function plannedForDay(budgets: BudgetSettings[], d: Date): number {
  const b = budgetOn(budgets, toISODate(d));
  if (!b) return 0;
  return periodTypeForDate(d) === "weekday" ? b.weekdayBudget / 5 : b.weekendBudget / 2;
}

export interface PeriodSummary {
  period: PeriodRange;
  budget: number;
  spent: number;
  added: number;
  remaining: number;
  isCurrent: boolean;
}

export function summarizePeriod(
  data: AppData,
  p: PeriodRange,
  today = new Date(),
): PeriodSummary {
  const budget = budgetForPeriod(data.budgets, p);
  // Period membership is derived from the date itself, so an entry can never
  // get stranded by a mismatched stored periodType.
  const spent = data.expenses
    .filter((e) => periodContains(p, e.date))
    .reduce((s, e) => s + e.amount, 0);
  const added = data.additions
    .filter((a) => periodContains(p, a.date))
    .reduce((s, a) => s + a.amount, 0);
  return {
    period: p,
    budget,
    spent,
    added,
    remaining: budget + added - spent,
    isCurrent: periodContains(p, toISODate(today)),
  };
}

export function currentPeriods(data: AppData, today = new Date()) {
  const { weekday, weekend } = weekPeriods(today);
  return {
    weekday: summarizePeriod(data, weekday, today),
    weekend: summarizePeriod(data, weekend, today),
    activeType: periodTypeForDate(today) as PeriodType,
  };
}

export interface MonthSummary {
  monthKey: string;
  planned: number;
  spent: number;
  added: number;
  /** planned - spent; positive = saved, negative = overspent */
  result: number;
  transactions: number;
  weekday: { planned: number; spent: number };
  weekend: { planned: number; spent: number };
}

export function expensesInMonth(expenses: Expense[], monthKey: string): Expense[] {
  return expenses.filter((e) => e.date.startsWith(monthKey));
}

export function additionsInMonth(additions: MoneyAddition[], monthKey: string): MoneyAddition[] {
  return additions.filter((a) => a.date.startsWith(monthKey));
}

export function summarizeMonth(data: AppData, monthKey: string): MonthSummary {
  const days = daysOfMonth(monthKey);
  let weekdayPlanned = 0;
  let weekendPlanned = 0;
  for (const d of days) {
    const amount = plannedForDay(data.budgets, d);
    if (periodTypeForDate(d) === "weekday") weekdayPlanned += amount;
    else weekendPlanned += amount;
  }
  const exp = expensesInMonth(data.expenses, monthKey);
  const weekdaySpent = exp
    .filter((e) => periodTypeForDate(fromISODate(e.date)) === "weekday")
    .reduce((s, e) => s + e.amount, 0);
  const weekendSpent = exp
    .filter((e) => periodTypeForDate(fromISODate(e.date)) === "weekend")
    .reduce((s, e) => s + e.amount, 0);
  const planned = weekdayPlanned + weekendPlanned;
  const spent = weekdaySpent + weekendSpent;
  return {
    monthKey,
    planned,
    spent,
    added: additionsInMonth(data.additions, monthKey).reduce((s, a) => s + a.amount, 0),
    result: planned - spent,
    transactions: exp.length,
    weekday: { planned: weekdayPlanned, spent: weekdaySpent },
    weekend: { planned: weekendPlanned, spent: weekendSpent },
  };
}

export function categoryTotals(data: AppData, monthKey?: string) {
  const exp = monthKey ? expensesInMonth(data.expenses, monthKey) : data.expenses;
  const map = new Map<string, number>();
  for (const e of exp) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
  return [...map.entries()]
    .map(([categoryId, total]) => ({
      categoryId,
      total,
      name: data.categories.find((c) => c.id === categoryId)?.name ?? "Other",
    }))
    .sort((a, b) => b.total - a.total);
}

/** Month keys that actually contain data, newest first. */
export function monthsWithData(data: AppData): string[] {
  const set = new Set<string>();
  for (const e of data.expenses) set.add(e.date.slice(0, 7));
  for (const a of data.additions) set.add(a.date.slice(0, 7));
  set.add(monthKeyOf(new Date()));
  return [...set].sort((a, b) => b.localeCompare(a));
}

export function monthPeriodSummaries(data: AppData, monthKey: string): PeriodSummary[] {
  return periodsInMonth(monthKey).map((p) => summarizePeriod(data, p));
}

/** Spending per period block across a month, for the trend chart. */
export function monthTrend(data: AppData, monthKey: string) {
  const periods = periodsInMonth(monthKey);
  const weeks = new Map<string, { label: string; spent: number; order: number }>();
  periods.forEach((p) => {
    const weekId = p.id.slice(0, -3);
    const entry = weeks.get(weekId) ?? {
      label: `W${weeks.size + 1}`,
      spent: 0,
      order: p.start.getTime(),
    };
    entry.spent += summarizePeriod(data, p).spent;
    weeks.set(weekId, entry);
  });
  return [...weeks.values()]
    .sort((a, b) => a.order - b.order)
    .map((w, i) => ({ label: `Week ${i + 1}`, spent: w.spent }));
}

export function historyTrend(data: AppData, months: number) {
  const keys = monthsWithData(data)
    .filter((k) => expensesInMonth(data.expenses, k).length > 0)
    .slice(0, months)
    .reverse();
  return keys.map((k) => {
    const s = summarizeMonth(data, k);
    return { monthKey: k, spent: s.spent, planned: s.planned };
  });
}

export function relativeDay(dateISO: string, today = new Date()): string {
  const d = fromISODate(dateISO);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((t.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
