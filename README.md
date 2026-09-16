# Daily Budget Flow

A calm, mobile-first personal spending tracker built for people who want to stay on top of their budget without a complex finance app.

Daily Budget Flow helps you track spending against two separate budgets:

- Weekday budget: Monday to Friday
- Weekend budget: Saturday and Sunday

It makes it easy to answer one simple question: am I ahead or behind plan this month?

## Features

- Separate weekday and weekend budgets
- Add, edit, and delete expenses
- Track money additions and adjustments
- See recent spending and month-over-month budget summaries
- Category-based spending organization
- Overview and history views for progress and trends
- Local-first persistent storage on the device
- Import/export of app data as JSON
- Lightweight onboarding flow for first-time setup
- Mobile-focused UI designed for quick daily use

## How it works

The app stores all user data locally in the browser using `localStorage`.

This means:

- data persists across reloads on the same browser/device
- the app works without a backend or login
- data is still available when you reopen the app on localhost
- the data is not synced to a cloud service yet

The current storage key is `spend-tracker:v1`.

## Current stack

- React + TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- date-fns
- localStorage persistence

## Getting started

Install dependencies:

```bash
npm install
```

Start the app in development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project structure

```text
src/
  components/
  lib/
  routes/
  styles.css
```

Key app logic lives in:

- `src/lib/store.tsx` — app state and mutations
- `src/lib/storage.ts` — local persistence logic
- `src/lib/calc.ts` — budget and summary calculations
- `src/lib/periods.ts` — weekday/weekend period handling
- `src/components/AddExpenseSheet.tsx` — add/edit expense form

## Data model

The app stores a single local user profile with a set of:

- budgets
- expenses
- additions
- categories

This is intentionally local-first so future work can add cloud sync or account support without redesigning the whole model.

## Notes

- There is no authentication or backend at this stage.
- All data is stored on the current device/browser.
- If you want a clean reset, clear the site storage for localhost or use the reset action in the app settings.

## Roadmap ideas

- sync across devices
- recurring expenses
- reports by category or month
- CSV export
- richer analytics

## License

This project is for local personal use and is not currently published as a package or library.

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
