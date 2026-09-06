# GLock Merchant Prototype

GLock is a GCash-inspired merchant workspace concept for the GCash iMAGination 2026 hackathon. It is deliberately prototype-safe: the app uses seeded/demo data, local browser persistence, simulated QR payments, and deterministic “Demo AI” recommendations. No official GCash assets, real payment rails, loans, authentication, or customer profiles are used.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The prototype also includes a Prisma + SQLite schema and seed script:

```bash
copy .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
```

The current demo UI keeps its working state in `localStorage` so the full judge flow is immediate and does not require a running database connection. Use the `Reset` control in the header to restore the seeded merchant snapshot.

## Optional environment variable

`GEMINI_API_KEY` enables the small server-side bridge at `/api/ai`. If it is absent or unavailable, the app uses deterministic fallback copy and keeps working offline.

## Demo script

1. Start at the simulated GCash home screen and open **View More**.
2. Open **GLock Merchant**. Use **Reconfigure merchant** to test the onboarding flow, including manual products and CSV import.
3. In **Overview**, select products, generate a Mock QR, and click **Simulate Payment**. Business Funds increase, stock decreases, and a compact receipt appears.
4. In **Products**, search/filter inventory, edit a product, toggle partner visibility, or import another CSV.
5. In **Planner**, adjust Adaptive Split, compare Budget/Balanced/Premium Forecast AI cards, edit quantities/prices, and confirm a plan. Reserved Funds increase and Available Funds decreases.
6. In **Connected Businesses**, approve the pending connection, review partner inventory, and configure your own shared inventory.
7. In **GRadar**, filter products and show anonymized demand, supply-vs-demand, and peak-time charts.

## CSV format

```csv
name,category,subcategory,stock,sellingPrice,costPrice,planningMethod,lowStockThreshold
Chicken Fillet,Food,Chicken,20,75,50,FORECAST_AI,5
Bottled Water,Drinks,Water,30,20,12,VMI,10
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

Known prototype limitations: local browser state and the Prisma seed path are intentionally separate; optional Gemini output is not wired into every client card; the simulated payment QR does not move real money; and the “GLoan” action is a demo affordance only.
