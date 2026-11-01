/// <reference types="node" />
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AppData, Category } from "@/lib/types";
import { buildPending, markSeen, suggestCategory } from "./ingest.ts";

const cat = (id: string, name: string): Category => ({
  id,
  userId: "u",
  name,
  icon: "circle-dashed",
  createdAt: "",
});
const categories = [cat("food", "Food"), cat("tr", "Transport"), cat("bills", "Bills")];

const base: AppData = {
  version: 1,
  user: null,
  budgets: [],
  expenses: [],
  additions: [],
  categories,
};

const SWIGGY = {
  id: "rx-1",
  sender: "AD-HDFCBK",
  body: "Sent Rs.250.00 From HDFC Bank A/C *1234 To SWIGGY On 12/10/26 Ref 628512345678",
  timestamp: new Date(2026, 9, 12).getTime(),
};
let n = 0;
const makeId = () => `p${++n}`;

test("keyword suggestion matches the user's category by name", () => {
  assert.equal(suggestCategory("Swiggy", categories, {}), "food");
  assert.equal(suggestCategory("Ola Cabs", categories, {}), "tr");
  assert.equal(suggestCategory("Coca-Cola Store", categories, {}), null);
  assert.equal(suggestCategory(null, categories, {}), null);
});

test("a learnt merchant category beats keywords", () => {
  assert.equal(suggestCategory("Swiggy", categories, { swiggy: "bills" }), "bills");
});

test("buildPending skips seen and already-pending messages", () => {
  const first = buildPending([SWIGGY], base, makeId);
  assert.equal(first.length, 1);
  assert.equal(first[0]!.suggestedCategoryId, "food");

  const withPending = { ...base, pending: first };
  assert.equal(buildPending([SWIGGY], withPending, makeId).length, 0);

  const seen = {
    ...base,
    smsImport: { enabled: true, seen: [first[0]!.fingerprint], merchantCategories: {} },
  };
  assert.equal(buildPending([SWIGGY], seen, makeId).length, 0);

  // Same message delivered twice in one batch (receiver + inbox back-fill)
  assert.equal(buildPending([SWIGGY, { ...SWIGGY, id: "inbox-9" }], base, makeId).length, 1);
});

test("markSeen caps the list and keeps newest", () => {
  let seen: string[] = [];
  for (let i = 0; i < 2100; i++) seen = markSeen(seen, `f${i}`);
  assert.equal(seen.length, 2000);
  assert.equal(seen.at(-1), "f2099");
});

test("stored review items never contain the raw account number or reference", () => {
  const [item] = buildPending([SWIGGY], base, makeId);
  assert.ok(item);
  assert.ok(!item.body.includes("628512345678"), item.body);
  assert.ok(!item.body.includes("1234"), item.body);
});
