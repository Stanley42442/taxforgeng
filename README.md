# TaxForge NG

**A free Nigerian tax calculator and business management platform — built for the 2026 Nigeria Tax Act.**

Covers CIT, VAT, WHT, PIT/PAYE, payroll, expenses, invoicing, and more for Nigerian individuals and businesses.

**Live site:** [taxforgeng.com](https://taxforgeng.com)

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS + Framer Motion
- **Backend:** Supabase (Auth, Postgres, Edge Functions)
- **Mobile:** Android app via Capacitor
- **PWA:** Offline-first with service workers

---

## Running Locally

Requirements: Node.js 18+ and npm (or bun)

```sh
# 1. Clone the repo
git clone https://github.com/Stanley42442/taxforgeng.git
cd taxforgeng

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:8080` by default.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npx vitest run` | Run test suite |

---

## Android App

The Android app is built with [Capacitor](https://capacitorjs.com/). After building the web app:

```sh
npm run build
npx cap sync android
npx cap open android   # opens Android Studio
```

---

## Tax Coverage (2026 Nigeria Tax Act)

| Tax | Details |
|---|---|
| **PIT / PAYE** | ₦800,000 tax-free band, 15%–25% rates |
| **CIT** | 0% for small companies (≤₦50M turnover, ≤₦250M assets), 30% standard |
| **VAT** | 7.5%, with exempt and zero-rated sectors |
| **WHT** | Withholding tax across payment types |
| **Rent Relief** | New 2026 deduction for individuals |

---

## Project Structure

```
src/
├── pages/          # 60+ route-level pages (all lazy-loaded)
├── components/     # Reusable UI components
├── lib/            # Tax calculation logic, PDF exports, utilities
├── hooks/          # Custom React hooks
├── contexts/       # Auth, subscription, language contexts
├── types/          # TypeScript types
└── __tests__/      # Vitest unit & integration tests
android/            # Capacitor Android project
supabase/           # Supabase config, migrations, edge functions
```

---

## License

Educational tool — not official tax advice. Operated by Gillespie / OptiSolve Labs, Port Harcourt, Rivers State, Nigeria.

© 2026 TaxForge NG
