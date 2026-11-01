import type { AppData, Category, PendingExpense, SmsImportState } from "@/lib/types";
import { merchantKey, parseBankSms, redactSmsBody, type RawSms } from "./parser.ts";

export const SEEN_LIMIT = 2000;

export const defaultSmsImport = (): SmsImportState => ({
  enabled: false,
  seen: [],
  merchantCategories: {},
});

/** Merchant keywords -> default category name (matched against the user's categories). */
const KEYWORDS: { name: string; pattern: RegExp }[] = [
  {
    name: "food",
    pattern:
      /swiggy|zomato|eatsure|domino|pizza|mcdonald|kfc|burger|starbucks|cafe|restaurant|bakery|zepto|blinkit|instamart|bigbasket|grocer|dmart/,
  },
  {
    name: "transport",
    pattern:
      /uber|\bola\b|rapido|metro|irctc|railway|redbus|fuel|petrol|indianoil|hpcl|bpcl|fastag|parking/,
  },
  {
    name: "shopping",
    pattern: /amazon|flipkart|myntra|ajio|meesho|nykaa|tatacliq|croma|reliance|decathlon|ikea/,
  },
  {
    name: "entertainment",
    pattern: /netflix|hotstar|prime ?video|spotify|bookmyshow|pvr|inox|youtube|sonyliv|zee5|steam/,
  },
  {
    name: "bills",
    pattern:
      /electricity|bescom|tata ?power|airtel|\bjio\b|vodafone|\bvi\b|bsnl|recharge|broadband|\bgas\b|water|insurance|\blic\b/,
  },
];

export function suggestCategory(
  merchant: string | null,
  categories: Category[],
  learnt: Record<string, string>,
): string | null {
  if (!merchant) return null;
  const key = merchantKey(merchant);
  const remembered = learnt[key];
  if (remembered && categories.some((c) => c.id === remembered)) return remembered;
  const text = merchant.toLowerCase();
  for (const k of KEYWORDS) {
    if (!k.pattern.test(text)) continue;
    const match = categories.find((c) => c.name.toLowerCase() === k.name);
    if (match) return match.id;
  }
  return null;
}

/**
 * Parse captured messages into new pending expenses, skipping anything already seen,
 * already pending, or not a debit.
 */
export function buildPending(
  messages: RawSms[],
  data: AppData,
  makeId: () => string,
): PendingExpense[] {
  const state = data.smsImport ?? defaultSmsImport();
  const known = new Set<string>([...state.seen, ...(data.pending ?? []).map((p) => p.fingerprint)]);
  const out: PendingExpense[] = [];
  for (const msg of messages) {
    const parsed = parseBankSms(msg);
    if (!parsed || known.has(parsed.fingerprint)) continue;
    known.add(parsed.fingerprint);
    out.push({
      id: makeId(),
      fingerprint: parsed.fingerprint,
      amount: parsed.amount,
      merchant: parsed.merchant,
      account: parsed.account,
      date: parsed.date,
      suggestedCategoryId: suggestCategory(
        parsed.merchant,
        data.categories,
        state.merchantCategories,
      ),
      sender: msg.sender,
      // Never keep the raw text: long numbers are masked before anything is stored.
      body: redactSmsBody(msg.body, parsed.amount),
      receivedAt: new Date(msg.timestamp).toISOString(),
    });
  }
  return out;
}

export function markSeen(seen: string[], fingerprint: string): string[] {
  const next = seen.filter((f) => f !== fingerprint);
  next.push(fingerprint);
  return next.length > SEEN_LIMIT ? next.slice(next.length - SEEN_LIMIT) : next;
}
