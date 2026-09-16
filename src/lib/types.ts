export type PeriodType = "weekday" | "weekend";

export interface User {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface BudgetSettings {
  id: string;
  userId: string;
  weekdayBudget: number;
  weekendBudget: number;
  /** ISO date (yyyy-MM-dd) from which these budgets apply */
  effectiveFrom: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  periodType: PeriodType;
  date: string; // yyyy-MM-dd
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoneyAddition {
  id: string;
  userId: string;
  amount: number;
  periodType: PeriodType;
  date: string; // yyyy-MM-dd
  note?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  createdAt: string;
}

export interface AppData {
  version: number;
  user: User | null;
  budgets: BudgetSettings[];
  expenses: Expense[];
  additions: MoneyAddition[];
  categories: Category[];
}
