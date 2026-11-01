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
  /** "sms" when confirmed from an imported bank SMS; absent for manual entries. */
  source?: "sms";
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

/** A debit read from a bank SMS, waiting for the user to confirm or dismiss it. */
export interface PendingExpense {
  id: string;
  /** Identifies the source message; used to never import it twice. */
  fingerprint: string;
  amount: number;
  merchant: string | null;
  account: string | null;
  date: string; // yyyy-MM-dd
  /** Category guessed from past choices or merchant keywords. */
  suggestedCategoryId: string | null;
  sender: string;
  body: string;
  receivedAt: string;
}

export interface SmsImportState {
  enabled: boolean;
  lastSyncAt?: string;
  /** Fingerprints already added or dismissed, newest last (capped). */
  seen: string[];
  /** merchantKey -> categoryId, learnt from confirmations. */
  merchantCategories: Record<string, string>;
}

export interface AppData {
  version: number;
  user: User | null;
  budgets: BudgetSettings[];
  expenses: Expense[];
  additions: MoneyAddition[];
  categories: Category[];
  /** Bank-SMS transactions awaiting review. Optional: older backups don't have it. */
  pending?: PendingExpense[];
  smsImport?: SmsImportState;
}
