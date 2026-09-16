# Daily Spend Companion

Build: Spend Tracker — V1

Build a polished, mobile-first personal spending tracker designed primarily for Android phones.

The app should feel like a minimal premium personal utility, not a traditional banking app.

The core purpose is extremely simple:

Help the user know how much they planned to spend, how much they actually spent, and whether they ended the month under or over their plan.

Do not add unnecessary financial-management features.

1. V1 PRODUCT SCOPE

V1 is:

Single user

Local-first

Offline capable

Dark mode only

No login

No authentication

No backend

No cloud sync

No bank integrations

All user data should be stored persistently on the device using a proper local database/storage layer.

The architecture should nevertheless include a userId relationship in the data model so cloud accounts and syncing can be added in a future version without redesigning the entire application.

2. LOCAL USER PROFILE

When the app is launched for the first time, create a local user profile through onboarding.

Do NOT ask for an email address or password.

The user should provide:

Name

Weekday spending budget

Weekend spending budget

Example:

Name:
Manjot

Weekday budget:
₹2,000

Weekend budget:
₹3,200

Create a local user record automatically after onboarding.

Example conceptual structure:

User

id

name

currency

createdAt

onboardingCompleted

BudgetSettings

id

userId

weekdayBudget

weekendBudget

effectiveFrom

The application should support only one active local user in V1.

3. FIRST-LAUNCH ONBOARDING

Create a beautiful, minimal onboarding flow.

Do not make onboarding feel like a form.

Screen 1 — Welcome

Display:

"Spend smarter."

Supporting text:

"Know what you can spend.
See what you actually spent.
Know whether you're ahead or behind."

Button:

"Get started"

Screen 2 — Name

Display:

"What should we call you?"

Input:

Name

Example:

Manjot

Button:

"Continue"

Screen 3 — Weekday budget

Display:

"Set your weekday budget"

Supporting text:

"How much can you spend from Monday to Friday?"

Input:

₹ 2,000

Button:

"Continue"

Screen 4 — Weekend budget

Display:

"Set your weekend budget"

Supporting text:

"How much can you spend on Saturday and Sunday?"

Input:

₹ 3,200

Button:

"Continue"

Screen 5 — Confirmation

Display:

"You're all set ✨"

Show:

Monday – Friday
₹2,000

Saturday – Sunday
₹3,200

Supporting text:

"Your weekday and weekend budgets are tracked separately."

Button:

"Start tracking"

After this, navigate to Home.

4. CORE BUDGET MODEL

There are TWO completely separate spending periods.

WEEKDAY

Monday through Friday.

Example:

Weekday budget = ₹2,000

WEEKEND

Saturday and Sunday.

Example:

Weekend budget = ₹3,200

IMPORTANT:

Saturday and Sunday expenses must NEVER be counted against the weekday budget.

The two budgets are completely independent.

5. PERIOD LOGIC

Use:

Monday–Friday → WEEKDAY

Saturday–Sunday → WEEKEND

Each calendar week therefore has:

One weekday spending period
+
One weekend spending period

Example:

Week of September 14:

Weekday:
Sep 14–18
Budget ₹2,000

Weekend:
Sep 19–20
Budget ₹3,200

Do not create a Sunday–Saturday week.

The app should correctly handle:

Month boundaries

Week boundaries

New months

Partial weeks

Partial current months

6. BUDGETS MUST NEVER ROLL OVER

This is extremely important.

Budgets are fixed.

If:

Weekday budget = ₹2,000

And the user spends:

₹1,500

The next weekday period is STILL:

₹2,000

Do NOT make it ₹2,500.

Similarly:

Weekday budget = ₹2,000

User spends:

₹2,400

Next weekday period is STILL:

₹2,000

Do NOT reduce it to ₹1,600.

The user is not creating a rolling budget.

The app is tracking performance against a fixed planned budget.

7. MONTHLY SAVED / OVERSPENT METRIC

This is the most important metric in the application.

At the end of a month, calculate:

TOTAL PLANNED SPENDING
minus
TOTAL ACTUAL SPENDING

Example:

Planned:
₹20,800

Spent:
₹18,300

Result:

₹2,500 saved

If:

Planned:
₹20,800

Spent:
₹22,100

Result:

₹1,300 overspent

This metric should NOT modify future budgets.

It is purely an overall monthly performance metric.

8. DO NOT CONFUSE EXTRA MONEY WITH SAVINGS

The user can optionally add extra money.

For example:

Weekday budget:
₹2,000

Extra money:
₹500

The normal budget remains:

₹2,000

The extra ₹500 should be stored separately.

Do NOT automatically treat the ₹500 as "saved."

The app must distinguish:

Planned budget

What the user originally intended to spend.

Extra money

Money the user added later.

Actual spending

What the user actually spent.

Monthly saved/overspent

How actual spending compares with the original planned budget.

This distinction is important.

9. ADD EXPENSE

Adding an expense should be the fastest action in the application.

Use a prominent "+" button.

When tapped, show an attractive bottom sheet/modal.

Fields:

Amount

Category

Period

Date

Optional note

Categories:

Food

Shopping

Transport

Entertainment

Bills

Other

Allow custom categories later, but these should exist by default.

The app should automatically determine:

Monday–Friday → Weekday

Saturday–Sunday → Weekend

The user should still be able to manually change the period if necessary.

Example:

₹450

Food

Weekday

16 September 2026

"Dinner"

Save.

10. ADD MONEY

Provide a separate "Add Money" action.

Fields:

Amount

Period:

Weekday

Weekend

Date

Optional note

Example:

₹500

Weekday

"Extra spending money"

This should be stored as a separate transaction type.

It must NOT change the configured budget.

11. HOME SCREEN

The Home screen is the most important screen.

The user should understand it within a few seconds.

Use this hierarchy:

A. MONTHLY PERFORMANCE — HERO

At the top show:

September

₹2,500 saved

Supporting text:

₹18,300 spent of ₹20,800 planned

If overspent:

₹1,300 overspent

Supporting text:

₹22,100 spent of ₹20,800 planned

This should be the strongest visual element on the page.

Do not show "money left overall" as the primary metric.

The key question is:

"Am I ahead or behind my plan this month?"

12. CURRENT PERIOD CARDS

Below the monthly hero, show two cards.

WEEKDAYS

Example:

₹1,350 / ₹2,000

Progress bar

₹650 left

Small supporting information:

₹0 added

or:

₹300 added

WEEKEND

Example:

₹2,400 / ₹3,200

Progress bar

₹800 left

The cards should clearly communicate:

Spent
Budget
Remaining

13. CURRENT PERIOD STATUS

If the user is currently in a weekday:

Make the Weekday card visually prominent.

If the user is currently on Saturday/Sunday:

Make the Weekend card visually prominent.

The other period can remain visible but slightly secondary.

This lets the user immediately understand:

"What can I spend right now?"

14. ADD EXPENSE BUTTON

Have a prominent floating or fixed "+" button.

The main action should be:

"+ Expense"

A smaller secondary action can be:

"+ Money"

Adding an expense should require very few interactions.

Target flow:

Open app
→ Tap +
→ Enter amount
→ Select category
→ Save

15. MONTHLY OVERVIEW

Create a dedicated Overview screen.

Show:

September 2026

₹2,500 saved

Then:

Planned
₹20,800

Spent
₹18,300

Saved
₹2,500

Create a simple visual comparison between planned and actual spending.

Do not make the dashboard feel like a financial analytics platform.

Keep visualizations simple and readable.

16. WEEKDAY VS WEEKEND BREAKDOWN

On Overview, show:

Weekdays

₹7,200 / ₹8,000

Weekend

₹11,100 / ₹12,800

This allows the user to understand where most spending is happening.

Use two clean visual cards or progress bars.

17. MONTHLY SPENDING TREND

Show a simple line chart for spending across the current month.

The chart should show actual spending by period/week.

For example:

Week 1
Week 2
Week 3
Week 4

The purpose is to help the user see whether their spending is accelerating or slowing down.

Keep the chart minimal.

Do not add unnecessary axes or statistics.

18. CATEGORY BREAKDOWN

Show where money was spent.

Example:

Food
₹6,200

Shopping
₹3,400

Transport
₹2,100

Entertainment
₹1,800

Other
₹1,500

Use clean horizontal bars or another simple visualization.

Avoid complicated pie charts.

Tapping a category should optionally show the associated transactions.

19. HISTORY SCREEN

The History screen should NOT just be a transaction dump.

It should primarily help the user understand their spending over time.

Structure it in two sections:

Recent transactions

Show compact transaction rows:

Food
Dinner
₹450
Today

Transport
Uber
₹280
Yesterday

Shopping
T-shirt
₹1,200
Sep 13

Each row should show:

Category icon

Description/note

Date

Amount

Period

Allow editing and deleting.

20. HISTORICAL MONTHS

Below or above transactions, provide a clear "Past months" section.

Each month should be represented as a compact but visually attractive summary card.

Example:

September 2026

₹18,300 spent

₹2,500 saved

24 transactions

August 2026

₹21,450 spent

₹650 overspent

31 transactions

July 2026

₹17,900 spent

₹1,300 saved

27 transactions

Each month should be tappable.

21. HISTORICAL SPENDING TREND

At the top of History or Overview, provide a monthly trend visualization.

Example:

May
₹19.2k

June
₹21.4k

July
₹17.9k

August
₹21.45k

September
₹18.3k

Use a clean line chart.

Allow:

3 months
6 months
12 months

Only show months for which actual data exists.

Do not invent or display fake zero values for months with no data.

22. MONTH DETAIL SCREEN

When the user taps a previous month, show a complete snapshot.

Example:

September 2026

₹2,500 saved

₹18,300 spent
₹20,800 planned

Then:

WEEKDAYS
₹7,200 / ₹8,000

WEEKEND
₹11,100 / ₹12,800

Then:

Category breakdown

Then:

Weekly/period breakdown

Then:

Transactions

The user should be able to understand exactly how the monthly result was calculated.

23. PERIOD HISTORY

Within a month detail screen, show previous weekday/weekend periods.

Example:

Weekday
Sep 7–11
₹1,650 / ₹2,000
₹350 under

Weekend
Sep 12–13
₹3,450 / ₹3,200
₹250 over

Weekday
Sep 14–18
₹1,200 / ₹2,000
₹800 under

Weekend
Sep 19–20
₹2,900 / ₹3,200
₹300 under

Each period should be tappable to see its transactions.

24. SETTINGS

Settings should contain:

Profile

Budget

Categories

Data

About

Profile

Show/edit:

Name

Currency

Budget

Edit:

Weekday budget

Weekend budget

IMPORTANT:

If the user changes their budget, it should apply to future periods.

Do NOT rewrite completed historical periods.

Historical months must preserve the budget values that were active at that time.

25. DATA / BACKUP

Since V1 is local-only, include a basic Data section.

Provide:

Export data

Import data

Reset all data

The exact implementation can be simple, but the user should have a way to back up their data before changing devices.

Clearly warn before resetting data.

Do not require a backend.

26. DATA MODEL

Use a proper structured local data model.

Conceptually:

User

id

name

currency

createdAt

onboardingCompleted

BudgetSettings

id

userId

weekdayBudget

weekendBudget

effectiveFrom

Expense

id

userId

amount

categoryId

periodType

date

note

createdAt

updatedAt

MoneyAddition

id

userId

amount

periodType

date

note

createdAt

Category

id

userId

name

icon

createdAt

Period data should be derived from dates rather than manually entered whenever possible.

27. CALCULATION RULES

For each weekday period:

Budget =
configured weekday budget applicable to that period

Spent =
sum of weekday expenses in that period

Remaining =
Budget + MoneyAdded - Spent

For each weekend period:

Budget =
configured weekend budget applicable to that period

Spent =
sum of weekend expenses in that period

Remaining =
Budget + MoneyAdded - Spent

However:

Monthly "Saved / Overspent" should compare:

Original planned budget
vs
Actual spending

Do NOT automatically include MoneyAdded as savings.

For example:

Planned = ₹20,800
Added = ₹1,000
Spent = ₹19,000

Monthly result should still be based on:

₹20,800 planned
− ₹19,000 spent
= ₹1,800 saved

The ₹1,000 addition should be shown separately as extra money.

28. OVERSPENDING

If the user spends beyond a period budget:

Example:

Budget:
₹2,000

Spent:
₹2,400

Show:

₹400 over

Do not alter the next period.

The monthly saved/overspent number should naturally reflect the additional spending.

29. BUDGET CHANGES

Budget changes should have an effective date.

Example:

January:
Weekday budget = ₹2,000

February:
Weekday budget = ₹2,500

January history should continue showing ₹2,000.

February should use ₹2,500.

Never retroactively recalculate old months using the current budget.

30. DARK MODE VISUAL DESIGN

V1 should be DARK MODE ONLY.

The design should feel:

Premium

Minimal

Calm

Modern

Sophisticated

Clean

Use:

Near-black background

Slightly lighter dark cards

Subtle borders

Rounded corners

Clean typography

Strong spacing

Restrained accent colors

Subtle shadows

Subtle gradients only where genuinely useful

Avoid:

Neon-heavy design

Excessive gradients

Excessive glassmorphism

Huge cards

Clutter

Generic banking UI

Too many colors

Excessive charts

31. VISUAL LANGUAGE

Use one primary accent color throughout the app.

Use subtle state indicators for:

Under budget
Over budget
Neutral

Do not make the entire interface green/red.

The "saved" and "overspent" states should be noticeable but tasteful.

Use typography to establish hierarchy.

For example:

Large:
₹2,500 saved

Medium:
₹18,300 spent of ₹20,800 planned

Small:
This month

32. MICRO-INTERACTIONS

Use subtle animations:

Progress bars animate when values change

Monthly saved/overspent amount can animate when updated

Cards gently transition when switching periods

Bottom sheets slide smoothly

Buttons have subtle press feedback

Success feedback after adding an expense

Do NOT over-animate the application.

The app should feel fast.

33. MOBILE UX

Design specifically for a phone.

Use:

Large touch targets

Bottom navigation

Bottom sheets

Swipe-friendly interactions where appropriate

Thumb-friendly placement of primary actions

Proper safe-area handling

Responsive layouts

Do not simply create a desktop website that happens to shrink onto a phone.

34. BOTTOM NAVIGATION

Use four tabs:

Home
History
Overview
Settings

Home:
Current spending and monthly status

History:
Transactions and previous months

Overview:
Detailed monthly analytics

Settings:
Profile, budgets, categories, data

35. EMPTY STATES

Design proper empty states.

For a new month:

"No spending yet"

Supporting text:

"Add your first expense to start tracking this month."

For no historical data:

"Your spending history will appear here."

Do not show fake charts or placeholder financial data.

36. FIRST MONTH EXPERIENCE

Immediately after onboarding, the Home screen should show the current month's configured budget.

Example:

September

₹0 spent

₹X planned

No saved/overspent result should be misleadingly shown before enough spending data exists.

Instead show something like:

"Let's see how you do this month."

As expenses are added, calculate the monthly position dynamically.

37. IMPORTANT PRODUCT PRINCIPLE

The application should always clearly distinguish these four concepts:

Budget

What the user planned to spend.

Spent

What the user actually spent.

Extra

Money the user added beyond the original budget.

Monthly result

Whether actual spending was below or above the original planned spending.

Do not combine these concepts in a confusing way.

38. PRIMARY USER EXPERIENCE

The app should answer these questions immediately:

"What can I spend right now?"

→ Current weekday/weekend card

"How am I doing this month?"

→ ₹X saved / ₹X overspent

"Where did my money go?"

→ Category breakdown

"How did I spend compared with previous months?"

→ Historical monthly cards + spending trend

"What did I spend last weekend?"

→ Period history

39. V1 SHOULD NOT INCLUDE

Do NOT build:

Bank account integration

Credit card integration

Investment tracking

Income tracking

Loans

Bill reminders

AI financial advice

Social features

Multiple accounts

Multiple currencies

Complex authentication

Cloud synchronization

Notifications unless absolutely necessary

Gamification

Achievements

Streaks

These can be considered later.

40. FUTURE-READY ARCHITECTURE

Even though V1 is local-only, keep the code modular.

Separate:

UI

Data/storage

Budget calculations

Monthly calculations

Period calculations

Categories

User profile

Create reusable calculation functions/services for:

Current period

Monthly summary

Saved/overspent

Category totals

Historical monthly totals

Do not put all calculations directly inside UI components.

The future goal is to be able to replace:

Local storage

with:

Cloud database + authentication

without rewriting the entire UI.

41. FINAL DESIGN GOAL

The finished application should feel like a small, polished app that someone would genuinely want to open every day.

The most important screen should communicate:

September

₹2,500 saved

₹18,300 spent
₹20,800 planned

WEEKDAYS
₹1,350 / ₹2,000
₹650 left

WEEKEND
₹2,400 / ₹3,200
₹800 left

The app should feel:

"Simple enough to use every day."

Not:

"Another complicated finance app."

Build V1 with polish and consistency rather than adding more functionality.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dbfe15de-39e3-4f6d-b10d-963938fc8d31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
