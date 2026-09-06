# GLock Project Guide

## 1. What GLock is

GLock is a merchant workspace concept inside a familiar GCash-style shell. It gives small Filipino businesses a separate business wallet view, a lightweight digital cashier, inventory tracking, restocking suggestions, merchant-to-merchant supply connections, and anonymized nearby demand signals through GRadar.

The current demo merchant is a mixed mini-mart. Seed examples also cover frozen goods, beverages, food stalls, grocery staples, and sari-sari-store patterns.

## 2. Prototype boundaries

The app is safe for a hackathon demo only. It does not implement:

- Real GCash API access, payments, banking, or authentication
- Real credit or GLoan decisions
- Real merchant settlement or customer tracking
- Customer names, phone numbers, account numbers, or private revenue data

UI labels such as `Mock QR`, `Simulated payment`, `Seeded merchant data`, and `Demo AI` are intentional.

## 3. Tech stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS with lightweight reusable components
- Recharts for GRadar visualizations
- `qrcode.react` for simulated payment QR codes
- Prisma with SQLite schema and seed script
- Browser `localStorage` for the working demo state
- Optional Gemini bridge at `/api/ai`

## 4. Repository structure

```text
app/                 Routes, global styles, and optional AI API route
components/          Client UI for home, onboarding, dashboard, and shared controls
lib/types.ts         Shared application types
lib/demo-data.ts     Deterministic seeded browser state
lib/demo-store.tsx   localStorage-backed React store
lib/ai.ts            Forecast, VMI, split, and GRadar fallback logic
lib/csv.ts           Product CSV parser
prisma/schema.prisma SQLite data model
prisma/seed.ts       Database seed data
docs/                Contributor, demo, and known-issues documentation
```

## 5. Environment variables

Copy `.env.example` to `.env`:

```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=""
```

`DATABASE_URL` is used by Prisma. `GEMINI_API_KEY` is optional. The app works without it.

## 6. Local setup

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

If Windows PowerShell says `npm.ps1` cannot run, use `npm.cmd` in the commands or set `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

There is no `pnpm` requirement in this repository and no Prisma migration directory. `prisma db push` is used for the local SQLite prototype.

## 7. Prisma and database model

`prisma/schema.prisma` contains merchants, products, transactions, transaction items, connected businesses, reserved plans, reserved plan items, and anonymized radar transactions.

SQLite does not support Prisma enum declarations in the configured connector, so status-like fields are stored as strings with documented values such as `PAID`, `APPROVED`, `FORECAST_AI`, and `VMI`. The browser demo mirrors these values in TypeScript unions.

The UI currently does not call Prisma at runtime. It loads deterministic state from `lib/demo-data.ts` and persists changes to `localStorage` so a judge can use the full flow without a database server. The Prisma path is kept valid, seeded, and ready for a later API-backed iteration.

## 8. Seed and reset instructions

Seed or refresh SQLite:

```bash
npm run db:push
npm run db:seed
```

Reset the browser demo by clicking **Reset** in the header. For a full SQLite reset, remove `dev.db`, then rerun `db:push` and `db:seed`.

The browser seed starts with GLock enabled, multiple vendors, both planning methods, low-stock items, paid transactions across more than seven days, a confirmed reserved plan, and anonymized GRadar rows. Use **Reconfigure merchant** from View More to exercise onboarding.

## 9. Main user flows

1. `/` shows the simulated GCash home wallet.
2. `/view-more` shows services and the GLock entry point.
3. `/glock/onboarding` collects business details and products, including CSV import and planning method selection.
4. `/glock/dashboard` contains Overview, Products, Planner, Connected Businesses, and GRadar tabs.
5. Overview creates a mock transaction QR and a compact receipt.
6. Products supports search, filters, CRUD, CSV import, and partner visibility.
7. Planner supports the seven-day gate, Adaptive Split, Forecast AI cards, VMI vendor cards, editing, and reserved funds.
8. Connected Businesses handles seeded vendors, approval/rejection, relationships, and shared inventory.
9. GRadar shows aggregated product demand, supply-vs-demand, time patterns, and privacy copy.

## 10. Transaction simulation logic

When the user clicks **Simulate Payment**:

1. A `PAID` transaction is created in browser state.
2. `merchant.businessFunds` increases by the order total.
3. Each purchased product's `stock` decreases by the selected quantity.
4. A receipt with payment and order details is displayed.

The QR value is a `glock://` mock value. It is not a payment credential.

## 11. Planner and reserved funds logic

The canonical formula is:

```ts
availableBusinessFunds = businessFunds - reservedBusinessFunds
```

Forecast and VMI cards are generated from low-stock products, planning method, approved vendor relationships, visible vendor inventory, and cost data. Before a card is confirmed, its edited total is compared with available Business Funds. If it is too high, confirmation is blocked and the UI suggests a cheaper card, fewer items, or a simulated transfer.

On confirmation, a `ReservedPlan`-shaped record is added to browser state and `reservedBusinessFunds` increases by the card total. Available Business Funds therefore decreases without removing the underlying business balance.

Adaptive Split estimates a rule-based profit amount and lets the user adjust the Personal/Business percentage. Accepting it moves the personal portion from Business Funds to Personal Funds.

## 12. Connected Businesses and VMI

VMI recommendations only use vendors with `APPROVED` status and `SUPPLIER` or `BOTH` relationships. A vendor product must be visible and have available quantity. The current merchant can share products, set a partner quantity, and set a partner price. The entire relationship is simulated and contains no private customer data.

## 13. GRadar privacy rules

GRadar uses seeded, anonymized merchant-type rows. It may show product names, categories, quantities, time windows, aggregated trends, and directional supply/demand patterns. It must not show customer identity, phone numbers, account numbers, exact merchant revenue, or private merchant profiles.

## 14. Gemini and fallback AI behavior

`lib/ai.ts` contains the deterministic helpers:

- `generateAdaptiveSplit`
- `generatePlannerExplanation`
- `generateForecastCards`
- `generateVmiCards`
- `generateRadarSummary`

`/api/ai` calls Gemini only when `GEMINI_API_KEY` is present. The Adaptive Split and GRadar copy can request optional server-generated text. If the key is missing, the route returns the supplied fallback and the local forecast/VMI helpers remain deterministic. No screen should depend on Gemini being available.

## 15. Known limitations

See [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for the current risk list. The most important limitation is that the working UI store and Prisma seed path are separate. This is deliberate for demo reliability, but a production version should connect UI actions to server-side persistence.

## 16. Future improvements

In priority order:

1. Add a typed server API backed by Prisma and replace the browser-only store.
2. Add automated flow tests for onboarding, payment, planner reservation, and privacy constraints.
3. Add migrations and a real database deployment strategy.
4. Make forecast and vendor card affordability explicit before rendering recommendations.
5. Add role-based merchant access and audited vendor consent flows.
6. Add richer historical sales ingestion and validated AI prompts.

## 17. Contributor checklist

- Run `npm install`.
- Run `npm run db:generate`, `npm run db:push`, and `npm run db:seed` when schema or seed files change.
- Run `npm run lint`, `npm run typecheck`, and `npm run build`.
- Exercise the demo path in `docs/DEMO_SCRIPT.md`.
- Keep payment, loan, banking, authentication, and customer data simulated.
- Preserve `Demo AI`, `Mock QR`, and privacy-safe labels.
- Do not add official GCash logos or copyrighted assets.
- Update README/docs when the architecture or demo flow changes.
