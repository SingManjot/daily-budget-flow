# Daily Budget Flow (Spend Tracker): project context

Context for future coding sessions. Read this before changing anything.

## What the app is

A local-first, mobile-first personal spending tracker. It has two separate budgets:
**weekday** (Mon–Fri) and **weekend** (Sat–Sun). The app answers one question:
*am I ahead or behind plan this month?* There is no backend and no auth. All data lives in
`localStorage`. It ships as a web app/PWA and as an Android app via Capacitor.
The currency is hard-coded to ₹ with `en-IN` number formatting.

## Constraints you must respect

- The project used to be built with Lovable. It no longer is, and all Lovable tooling has
  been removed. Don't reintroduce `@lovable.dev/*` packages or Lovable-specific files.
- Don't rewrite pushed history (no force-push or amending pushed commits).
- `src/routeTree.gen.ts` is generated, so don't edit it. Routes are file-based (see
  `src/routes/README.md`). Keep `<Outlet />` in `__root.tsx`.
- `src/components/ui/*` are shadcn/ui primitives. Most are unused. Only `drawer`, `sonner`,
  `switch` and a few others matter. Edit them with care.

## Stack

React 19 · TypeScript · TanStack Start/Router (static prerender, no server) · Vite 8 · Tailwind CSS v4 (CSS-first config in `src/styles.css`)
· date-fns · recharts · vaul (bottom sheets) · sonner (toasts) · lucide-react icons ·
Capacitor 8 (status bar, haptics, keyboard).

Build: `vite.config.ts` is a plain Vite config (Tailwind, TanStack Start with prerender, React).
There is no runtime server: `npm run build` prerenders `/`, `/history`, `/overview` and
`/settings` into `dist/client`, which is both the static web deploy folder and Capacitor's
`webDir`. `/month/$month` is rendered client-side. `dist/server` is only used during the build.

Commands: `npm run dev` (port 8080), `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run android:sync`.
`npm test` runs `src/**/*.test.ts` with Node's built-in runner (`--experimental-strip-types`,
no extra deps). Test files and the modules they import must use explicit `.ts` relative imports
and only `import type` from `@/` paths.
CI (`.github/workflows/ci.yaml`) is a manual `workflow_dispatch` Android APK build
(check / debug / release). It has no automatic test or lint gate. Only `debug`/`release` run
Gradle, so use `debug` to verify native code compiles.

Running the dev server inside a sandbox may need `--host 127.0.0.1` because IPv6 can be
unavailable there.

## Architecture map

```
src/
  routes/
    __root.tsx        HTML shell, head/meta/fonts, providers: Query → Theme → Store,
                      AppGate (onboarding gate), Toaster, initNative()
    index.tsx         Home: greeting, month result hero, MonthProgress, 2 PeriodCards, recent 4
    history.tsx       Monthly trend chart (3/6/12M), past months → /month/$month, last 20 txns
                      (edit/delete)
    overview.tsx      Current month: planned/spent/saved stats, weekday-vs-weekend bars,
                      weekly trend, category breakdown
    month.$month.tsx  One month's detail: splits, categories, expandable periods, all txns
    settings.tsx      Profile name, theme, budgets (with "applies from" date), categories,
                      export/import JSON, reset
  components/
    AppShell.tsx      Floating glass action row (Add Expense / Money) + 4-tab glass tab bar
    AddExpenseSheet   vaul Drawer for add/edit expense (amount, category, date, period)
    AddMoneySheet     Drawer to add extra money to a period (does not change the budget)
    Onboarding.tsx    5 steps: welcome → name → weekday budget → weekend budget → confirm
    MonthProgress     Bar strip with one column per weekday/weekend block in the month
    PeriodCard        Spent/budget/remaining card for one block
    Segmented.tsx     iOS-style segmented control (radiogroup)
    CategoryIcon.tsx  icon-name → lucide map, plus CategoryBadge (rounded tile for list rows)
    AmountField, ThemePicker, Gauge (Gauge is currently unused)
  lib/
    types.ts          AppData { version, user, budgets[], expenses[], additions[], categories[] }
    storage.ts        localStorage key `spend-tracker:v1`, emptyData, DEFAULT_CATEGORIES, uid()
    store.tsx         StoreProvider/useStore: all mutations; each one calls commit(), which
                      sets state and saves
    periods.ts        ISO-week based weekday/weekend PeriodRange, month helpers
    calc.ts           All budget maths (see below)
    format.ts         formatMoney (₹, en-IN, rounded abs), formatCompact (k / L)
    theme.ts          6 themes; theme key `spend-tracker:theme`; sets data-theme on <html>
    use-theme.tsx     ThemeProvider; also syncs the Android status bar
    native.ts         Capacitor helpers: syncStatusBar, initNative, hapticTap/Success.
                      All are no-ops on web.
    sms/              Bank-SMS import (Android): parser.ts (pure, tested), ingest.ts (dedupe +
                      category suggestion, tested), plugin.ts (JS bridge), use-sms-sync.ts
plugins/sms-capture/  Local Capacitor plugin (Java), linked via "file:" dependency
```

## Bank SMS import

> **Currently switched off.** `SMS_IMPORT_ENABLED` in `src/lib/sms/config.ts` is `false`, and
> `capacitor-sms-capture` is not in `package.json`, so the APK requests no SMS permissions.
> Reason: Play Protect's enhanced fraud protection blocks sideloaded apps that request
> SMS/notification-listener/accessibility access. The plan is to ship through Google Play
> (internal testing first) with the "SMS-based money management" declaration, then re-enable:
> set the flag to `true` and `npm install --save capacitor-sms-capture@file:plugins/sms-capture`.
> The code, tests and native plugin are kept and maintained in the meantime.

- **Why a local plugin:** CI runs `npx cap add android` fresh each build and `android/` is
  gitignored, so native code can't live there. `plugins/sms-capture` is an npm package with
  `capacitor.android.src`; `cap sync` merges its manifest (RECEIVE_SMS, READ_SMS, receiver).
- **Flow:** `SmsReceiver` (system SMS broadcast) → `SmsFilter.isCandidate` (drops phone-number
  senders, OTPs, anything without an amount + debit word) → `SmsStore` queue in
  SharedPreferences (cap 300) → `smsReceived` event. In JS, `useSmsSync` (mounted in AppShell)
  drains the queue on launch, on foreground and on that event → `ingestSms` → `data.pending` →
  Home banner → `ReviewSheet` (pick category → `confirmPending` adds an Expense with
  `source: "sms"` and remembers merchant → category; or `dismissPending`).
- Settings → SMS Import toggles it (requests permission) and back-fills 30 days from the inbox.
- **Dedupe:** fingerprint = hash of the message body; `smsImport.seen` (cap 2000) stores
  fingerprints already added/dismissed.
- **Adding a bank format:** add a masked sample to `parser.test.ts`, then adjust patterns in
  `parser.ts`. The Java pre-filter must also accept it (`SmsFilter.java`).
- **Security invariants (from the Nov 2026 audit; keep them, they are tested):**
  - Secrets never reach storage. `SECRET` in `SmsFilter.java` (first layer, before the native
    queue) and in `parser.ts` (second layer) reject anything mentioning OTP, PIN, passcode,
    password, verification or auth code, CVV, or "do not share". Keep both regexes identical.
    Missing an expense is acceptable; storing an OTP is not.
  - Bodies over 2000 chars are rejected before any regex runs (concatenated SMS can reach ~39k).
  - Only `redactSmsBody` output is stored in `pending[].body` (4+ digit runs masked except the
    amount). Raw text exists only briefly in the native queue.
  - The native receiver captures only while `SmsStore` "enabled" is true; `useSmsSync` mirrors
    the in-app switch into it, and turning the switch off clears the queue.
  - Export (Settings → Data) blanks `pending[].body` and `sender`.
  - The receiver is protected by `BROADCAST_SMS`, so only the OS can deliver to it.
  - The WebView loads only bundled JS (no `server.url`/`allowNavigation`), so only app code
    can call the bridge. Never add remote scripts or navigation to remote origins.
  - CI sets `android:allowBackup="false"` after `cap add`. Debug APKs are debuggable (adb
    `run-as` and WebView inspection), so use the release APK for real data.
- **Play Store:** SMS permissions need the "SMS-based money management" declaration and are
  approved case by case. The Settings copy doubles as the prominent disclosure.
  A notification-listener source is the fallback if the declaration is refused.

## Domain rules (calc.ts / periods.ts)

- Periods: each ISO week has a `…-WD` block (Mon–Fri) and a `…-WE` block (Sat–Sun).
  Period ids look like `2026-W44-WD`.
- An entry's period comes from **its date** (`periodContains`), not from the stored
  `periodType`.
- Budgets are versioned by `effectiveFrom` and never retroactive. `budgetOn(date)` picks the
  latest one whose effectiveFrom ≤ date, and otherwise falls back to the earliest.
- Per-day planned amount = weekdayBudget/5 or weekendBudget/2. Monthly planned = the sum over
  the month's days, which handles blocks split across months.
- `monthProgress`: savings are only "banked" once a block has fully **closed** (it is past).
  Every month restarts at 0.
- Additions (extra money) raise a period's `remaining`. They are excluded from the month's
  `result` (planned − spent).
- Deleting a category leaves its expenses orphaned. The UI then shows "Other" or a blank
  category name.

## Design system (after the Apple-HIG refresh)

The refresh was guided by the Apple design skill (https://github.com/dickwu/apple-design-skill),
which packages Apple's Human Interface Guidelines as reference files. Clone it again if you
need to cite the HIG.

- **Tokens** live in `src/styles.css` as oklch CSS variables per theme. Components use semantic
  Tailwind classes: `bg-card`, `text-mut`, `ring-hair`, `bg-brass`, `text-brasshi`,
  `text-under`, `text-over`. Never hard-code colours in components, except ThemePicker
  swatches and the `native.ts` status-bar hex values. Keep those two in sync with the themes.
- Themes: brass (default, no data-theme attribute), carbon, violet, ocean (dark), and blush,
  sand (light, which get the `.light` class and `color-scheme: light`).
- **Type:** the system UI stack (SF Pro on Apple devices, Roboto on Android, Inter as the web
  fallback), 15px body, tabular numbers. Cormorant Garamond italic (`font-display`) is the
  brand voice, used only for hero words ("saved", "overspent", onboarding headlines).
  Don't spread it further.
- **Utilities:** `title-large` (34px iOS large title), `label-section` (12px uppercase
  section header), `glass` (backdrop blur for the floating functional layer only, never for
  content), `pressable` (scale on press), `anim-rise`, `anim-settle`, `anim-bar`,
  `safe-bottom`.
- **Rules the refresh follows** (keep them):
  - Touch targets are at least 44px. Icon buttons use `grid size-10 place-items-center`.
  - No text below 11px.
  - Inputs are 16px or larger, which stops iOS from zooming on focus.
  - The tab bar has icons and one-word labels and only navigates. Actions such as Add Expense
    or Money sit in a separate row above it.
  - `/month/*` highlights the History tab.
  - Button and sheet titles use title case ("Add Expense", "Save Changes").
  - `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast: more` are
    handled at the bottom of styles.css.
  - Sheets (vaul) have a 36×5 grabber, 28px top radius and safe-area bottom padding.
- `main` has `pb-40` so content clears the fixed floating bars. Keep that padding if you change
  the bar height.

## Known gaps / ideas

- `npm run lint` is clean apart from react-refresh warnings in shadcn files and store.tsx.
- Only the SMS parser/ingest have tests. calc.ts is pure and would be easy to unit test.
- `Gauge.tsx` and most shadcn ui components are unused.
- Currency is fixed to ₹ (`completeOnboarding` hard-codes it).
- Import does only minimal validation: it checks that `expenses` exists.
- README roadmap: sync, recurring expenses, CSV export, richer analytics.
