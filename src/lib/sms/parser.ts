/**
 * Turns a bank / card SMS into a structured debit, or null when the message isn't a
 * completed debit (credits, OTPs, offers, reminders, failed payments, future mandates).
 *
 * Pure and dependency-free so it runs under `node --test` (see parser.test.ts).
 * Tune the patterns here when a bank's format isn't recognised: add a sample to the tests first.
 */

export interface RawSms {
  id: string;
  sender: string;
  body: string;
  /** epoch ms the message was sent/received */
  timestamp: number;
}

export interface ParsedDebit {
  amount: number;
  /** Payee as written in the SMS, cleaned up; null when the bank doesn't say. */
  merchant: string | null;
  /** Last digits of the account or card, if present. */
  account: string | null;
  /** Bank reference / UPI ref / RRN, if present. */
  ref: string | null;
  /** yyyy-MM-dd, from the message timestamp. */
  date: string;
  /** Stable id used to avoid importing the same message twice. */
  fingerprint: string;
}

const OTP = /\botp\b|one[\s-]time password|verification code|\bpin\b.*\bshare\b/i;

/** Messages that mention money but aren't a completed debit. */
const NOT_A_DEBIT = new RegExp(
  [
    "will be debited",
    "to be debited",
    "shall be debited",
    "is due",
    "due (?:on|by|date)",
    "payment due",
    "min(?:imum)?\\.? (?:amount|amt)",
    "requested",
    "request(?:ed)? money",
    "collect request",
    "pre-?approved",
    "\\boffer\\b",
    "\\bwin\\b",
    "cashback (?:up ?to|of up)",
    "\\bloan\\b.*\\b(?:eligible|approved|offer)",
    "statement (?:is )?generated",
    "bill (?:is )?generated",
    "\\b(?:failed|declined|unsuccessful|rejected)\\b",
    "reminder",
    "auto-?pay (?:is )?(?:set|scheduled|registered)",
    "mandate (?:is )?(?:created|registered|set)",
  ].join("|"),
  "i",
);

const DEBIT =
  /\b(?:debited|debit(?:ed)?\b|spent|withdrawn|withdrawal|purchase[ds]?|paid|sent|dr\b)/i;
const CREDIT_ONLY =
  /\b(?:credited to (?:your|ur)|has been credited|received|deposited|refund|reversed|reversal)\b/i;

/** "Rs.1,234.50", "INR 500", "₹ 99" — capture the number. */
const AMOUNT = /(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi;
/** SBI-style "debited by 150.0" with no currency marker. */
const BARE_DEBIT_AMOUNT = /\bdebited\s+(?:by|for|with)\s+([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i;
/** Text right before an amount that marks it as a balance or limit, not the transaction. */
const BALANCE_CONTEXT = /(?:bal(?:ance)?|avl|available|limit|outstanding)[^0-9]{0,12}$/i;

const ACCOUNT =
  /(?:a\/?c|acct|account|card)(?:\s*(?:no\.?|number))?(?:\s*(?:ending|ending with|ending in))?[\s:.-]*(?:[x*]+\s*)?([0-9]{3,6})\b/i;

const REF =
  /(?:ref(?:erence)?(?:\s*no\.?)?|utr(?:\s*no\.?)?|txn\s*id|rrn|upi\s*ref(?:\s*no\.?)?|upi\s*:|upi\/p2[am]\/)[\s:.#-]*([a-z0-9]{6,})/i;

/** Ordered: the first pattern that yields a plausible name wins. */
const MERCHANT_PATTERNS: RegExp[] = [
  // "trf to SWIGGY Refno" (SBI UPI) / "transfer to X Ref"
  /\b(?:trf|transfer(?:red)?) to\s+(.+?)\s+(?:ref(?:no)?|upi|on)\b/gi,
  // "; ZOMATO credited." (ICICI UPI)
  /;\s*([^;]+?)\s+credited\b/gi,
  // "UPI/P2M/528512345678/BigBasket" (Axis)
  /\bupi\/p2[am]\/[0-9]+\/([^/]+?)(?:\/|\s+not you|\s+-|$)/gi,
  // "to VPA name@bank" / "VPA name@bank" / "to name@ybl"
  /\b(?:vpa|to)\s+([\w.-]+@[a-z][\w-]*)/gi,
  // "Info: AMAZON PAY" / "Info- UPI-..."
  /\binfo[\s:.-]+(.+?)(?:[.;]|\s+avl|\s+bal|$)/gi,
  // "at AMAZON on" / "To SWIGGY On" / "towards NETFLIX."
  /\b(?:at|to|towards|for)\s+(?!(?:a\/?c|your|ur|you|the account|account|card)\b)([a-z0-9&@'._*\- ]{2,40}?)(?=\s+(?:on|via|ref(?:no)?|upi|avl|bal|from|using|txn|thru|through|is|has|was|dated|at|not)\b|[.,;(]|\s*$)/gi,
];

/** Generic words some banks put where the payee would be. */
const NOT_A_MERCHANT =
  /^(?:upi|neft|imps|rtgs|pos|atm|ecom|e-?commerce|merchant|beneficiary|a\/?c.*|account.*|card.*|your.*|(?:rs\.?|inr|₹)\s*[\d,.]*|[\d\s+-]+)$/i;

export function parseBankSms(sms: RawSms): ParsedDebit | null {
  const body = sms.body.replace(/\s+/g, " ").trim();
  if (!body) return null;
  if (OTP.test(body)) return null;
  if (NOT_A_DEBIT.test(body)) return null;
  const isDebit = DEBIT.test(body);
  if (!isDebit && CREDIT_ONLY.test(body)) return null;
  if (!isDebit) return null;

  const amount = findAmount(body);
  if (amount === null || amount <= 0) return null;

  return {
    amount,
    merchant: findMerchant(body),
    account: ACCOUNT.exec(body)?.[1] ?? null,
    ref: REF.exec(body)?.[1] ?? null,
    date: isoDate(sms.timestamp),
    fingerprint: fingerprint(body),
  };
}

function findAmount(body: string): number | null {
  for (const m of body.matchAll(AMOUNT)) {
    const before = body.slice(Math.max(0, (m.index ?? 0) - 24), m.index ?? 0);
    if (BALANCE_CONTEXT.test(before)) continue;
    const value = Number((m[1] ?? "").replace(/,/g, ""));
    if (Number.isFinite(value)) return value;
  }
  const bare = BARE_DEBIT_AMOUNT.exec(body)?.[1];
  if (bare) {
    const value = Number(bare.replace(/,/g, ""));
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function findMerchant(body: string): string | null {
  for (const pattern of MERCHANT_PATTERNS) {
    for (const m of body.matchAll(pattern)) {
      const cleaned = m[1] ? cleanMerchant(m[1]) : null;
      if (cleaned) return cleaned;
    }
  }
  return null;
}

export function cleanMerchant(raw: string): string | null {
  let s = raw.trim();
  // VPA: keep the handle, drop the bank part ("swiggy.upi@axisbank" -> "swiggy.upi")
  if (/^[\w.-]+@[\w.-]+$/.test(s)) s = s.split("@")[0] ?? s;
  s = s
    .replace(/^(?:upi|pos|ecom|vpa)[\s/:-]+/i, "")
    .replace(/[\s.,;:-]+$/, "")
    .replace(/\s{2,}/g, " ");
  if (s.length < 2 || NOT_A_MERCHANT.test(s)) return null;
  // SHOUTING -> Title Case; leave mixed case alone.
  if (s === s.toUpperCase()) {
    s = s.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
  }
  return s.slice(0, 40);
}

/** Lower-case alphanumerics only: the key used to remember a merchant's category. */
export function merchantKey(merchant: string): string {
  return merchant.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isoDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** FNV-1a over the normalised body: bank alerts carry refs/balances, so bodies are unique. */
function fingerprint(body: string): string {
  const text = body.toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `sms-${(h >>> 0).toString(36)}`;
}
