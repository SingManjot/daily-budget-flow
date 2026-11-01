/// <reference types="node" />
// Run with: npm test   (node --experimental-strip-types --test)
// Samples are modelled on common Indian bank formats; account numbers and refs are made up.
// When a real message isn't parsed correctly, add it here (masked) and fix parser.ts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { merchantKey, parseBankSms, redactSmsBody, type RawSms } from "./parser.ts";

const TS = new Date(2026, 9, 12, 14, 22).getTime(); // 12 Oct 2026, local time
const sms = (body: string, sender = "AD-HDFCBK"): RawSms => ({
  id: "t",
  sender,
  body,
  timestamp: TS,
});

const debits: {
  name: string;
  body: string;
  amount: number;
  merchant: string | null;
  account?: string;
}[] = [
  {
    name: "HDFC UPI (Sent ... To)",
    body: "Sent Rs.250.00\nFrom HDFC Bank A/C *1234\nTo SWIGGY\nOn 12/10/26\nRef 628512345678\nNot You?\nCall 18002586161/SMS BLOCK UPI to 7308080808",
    amount: 250,
    merchant: "Swiggy",
    account: "1234",
  },
  {
    name: "HDFC credit card (Spent ... At)",
    body: "Spent Rs.1,299 On HDFC Bank Card 5678 At AMAZON PAY INDIA On 2026-10-12:14:22:10.Not You? To Block+Reissue Call 18002586161/SMS BLOCK CC 5678 to 7308080808",
    amount: 1299,
    merchant: "Amazon Pay India",
    account: "5678",
  },
  {
    name: "SBI UPI (debited by, no currency)",
    body: "Dear UPI user A/C X1234 debited by 150.0 on date 12Oct26 trf to ZOMATO Refno 628512345678. If not u? call 1800111109. -SBI",
    amount: 150,
    merchant: "Zomato",
    account: "1234",
  },
  {
    name: "ICICI UPI (; X credited)",
    body: "ICICI Bank Acct XX123 debited for Rs 500.00 on 12-Oct-26; AMAZON credited. UPI:628512345678. Call 18002662 for dispute. SMS BLOCK 123 to 9215676766.",
    amount: 500,
    merchant: "Amazon",
    account: "123",
  },
  {
    name: "Axis UPI (UPI/P2M/ref/name)",
    body: "INR 2,000.00 debited\nA/c no. XX1234\n12-10-26, 14:22:10\nUPI/P2M/628512345678/BigBasket\nNot you? SMS BLOCKUPI Cust ID to 919951860002\nAxis Bank",
    amount: 2000,
    merchant: "BigBasket",
    account: "1234",
  },
  {
    name: "Kotak UPI to VPA",
    body: "Sent Rs.120.00 from Kotak Bank AC X1234 to merchant.shop@ybl on 12-10-26.UPI Ref 628512345678. Not you, https://kotak.com/KBANKT/Fraud",
    amount: 120,
    merchant: "merchant.shop",
  },
  {
    name: "ICICI credit card with limit after amount",
    body: "INR 499.00 spent on ICICI Bank Card XX9876 on 12-Oct-26 at NETFLIX. Avl Limit: INR 1,00,000.00. If not you, call 1800 2662/SMS BLOCK 9876 to 9215676766",
    amount: 499,
    merchant: "Netflix",
    account: "9876",
  },
  {
    name: "balance mentioned before the amount",
    body: "Avl Bal Rs 10,000.00. Rs 250 debited from A/c XX4321 at UBER INDIA on 12-10-26.",
    amount: 250,
    merchant: "Uber India",
  },
  {
    name: "ATM withdrawal has no merchant",
    body: "Rs.2000 withdrawn at ATM from A/c XX1234 on 12-10-26. Avl bal Rs 8,000",
    amount: 2000,
    merchant: null,
  },
];

for (const c of debits) {
  test(`debit: ${c.name}`, () => {
    const r = parseBankSms(sms(c.body));
    assert.ok(r, "expected a debit");
    assert.equal(r.amount, c.amount);
    assert.equal(r.merchant, c.merchant);
    if (c.account) assert.equal(r.account, c.account);
    assert.equal(r.date, "2026-10-12");
  });
}

const ignored: { name: string; body: string }[] = [
  {
    name: "credit",
    body: "Rs.5,000.00 credited to your A/c XX1234 by VPA abc@okaxis on 12-10-26 (UPI Ref No 628512345678).",
  },
  { name: "OTP", body: "OTP for txn of Rs 500 at AMAZON is 123456. Do not share it with anyone." },
  { name: "loan promo", body: "Get a pre-approved loan of Rs 5,00,000 at 10.5%. Apply now!" },
  {
    name: "future mandate",
    body: "Rs 199 will be debited from your a/c XX1234 on 15-10-26 for NETFLIX autopay.",
  },
  {
    name: "failed payment",
    body: "Your txn of Rs 500 at FLIPKART has failed. Amount not debited.",
  },
  { name: "bill reminder", body: "Reminder: Rs 2,450 is due on your card XX9876 by 20-10-26." },
  {
    name: "collect request",
    body: "abc@okicici has requested money Rs 300 from you on Google Pay. Approve to pay.",
  },
  { name: "refund", body: "Refund of Rs 899 has been credited to your A/c XX1234." },
];

for (const c of ignored) {
  test(`ignored: ${c.name}`, () => {
    assert.equal(parseBankSms(sms(c.body)), null);
  });
}

test("fingerprint is stable and differs per message", () => {
  const body = debits[0]!.body;
  assert.equal(parseBankSms(sms(body))!.fingerprint, parseBankSms(sms(body))!.fingerprint);
  assert.notEqual(
    parseBankSms(sms(body))!.fingerprint,
    parseBankSms(sms(debits[1]!.body))!.fingerprint,
  );
});

test("merchantKey normalises", () => {
  assert.equal(merchantKey("Amazon Pay India"), "amazonpayindia");
});

// --- Security: secrets must never be parsed (and therefore never stored) -----------------
const secrets = [
  "482913 is your OTP for txn of Rs 500 at AMAZON",
  "Use 482913 to authorise your txn of Rs.1,500.00 at FLIPKART on HDFC Card 1234. Do not share.",
  "Your one-time PIN for purchase of INR 2,000 at MYNTRA is 739201. Valid for 10 mins.",
  "Dear Customer, 5521 is the security code for transaction of Rs 999 at SWIGGY. Never share it.",
  "Authentication code 66120 for payment of Rs. 300 to Zomato. Do not share with anyone - ICICI Bank",
  "Passcode 908172 to complete txn of INR 4,999 on Axis Bank card XX4321",
  "Your 3D Secure password is 445566 for purchase Rs 1200",
  "Rs 750 debited. Your MPIN was changed. If not you call 1800",
  "Code 1234 to verify payment of Rs 99 at NETFLIX",
];
for (const body of secrets) {
  test(`secret never parsed: ${body.slice(0, 40)}`, () => {
    assert.equal(parseBankSms(sms(body)), null);
  });
}

test("oversized messages are rejected before parsing", () => {
  assert.equal(parseBankSms(sms("Rs 5 debited " + "trf to a ".repeat(4000))), null);
});

test("redactSmsBody masks long numbers but keeps the amount", () => {
  const body =
    "Sent Rs.2000.00 From HDFC Bank A/C *1234 To SWIGGY On 12/10/26 Ref 628512345678 Avl Bal Rs 18,450.50 Call 18002586161";
  const out = redactSmsBody(body, 2000);
  assert.ok(out.includes("Rs.2000.00"), out);
  for (const secret of ["1234", "628512345678", "18,450", "18002586161"]) {
    assert.ok(!out.includes(secret), `${secret} leaked: ${out}`);
  }
  assert.ok(out.includes("12/10/26"), "short numbers stay readable");
});
