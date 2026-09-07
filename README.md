# GLock Merchant Prototype

GLock is a GCash-inspired merchant workspace concept for the GCash iMAGination 2026 hackathon. It helps Filipino small merchants separate business funds, track inventory, simulate QR sales, plan restocking, connect with vendors, and view privacy-safe demand signals.

This is a prototype only: data is seeded or simulated, QR payments do not move money, and no official GCash assets or integrations are used.

Forecast AI makes one demand-and-inventory replenishment recommendation, then shows the same items and quantities as Tipid Plan, Balanced Plan, and High Availability Plan. Matched items use versioned DTI SRP references for the lowest, prevailing/average, and highest estimated acquisition-cost views; each view recalculates its total and Business Cash/GCash funding split.

For the detailed architecture and contribution notes, see [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md). For the judge-facing walkthrough, see [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## Run locally

This repository uses npm. If PowerShell blocks `npm.ps1`, use `npm.cmd` or set `RemoteSigned` for your current user.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo authentication and account switching

GLock includes prototype-only hardcoded credentials so the two merchant perspectives can be simulated in one browser:

| Account | Username | Password |
| --- | --- | --- |
| Kape Kubo Mini Mart / Maya Santos | `maya` | `maya123` |
| Kuya Mark Frozen Goods / Mark Villanueva | `kuya.mark` | `kuya123` |

Sign in through `/glock/login`, then use **Switch account** in the header. Reservations placed by Kape Kubo with Kuya Mark appear as pending in the **Reservations** dropdown inside **Connected Businesses**. Fulfilling one updates the shared simulated inventory and funds; the workspace is stored only in this browser's `localStorage`.

## Prisma and seed data

```bash
copy .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
```

There is no migration history in this prototype; `db:push` is the intentional local-development equivalent. The UI uses browser `localStorage` for an immediate judge flow, while Prisma/SQLite provides the documented data model and seed path.

Use the **Reset** control in the header to restore the client-side seeded merchant snapshot. To reset the SQLite database, remove the local `dev.db` file and rerun `db:push` and `db:seed`.

## Optional environment variable

`GEMINI_API_KEY` enables the server-side Gemini bridge at `/api/ai` and Gemini-generated Forecast AI restock cards at `/api/ai/forecast`. Without it, GLock uses deterministic rule-based fallback recommendations and remains usable offline. `GEMINI_MODEL` is optional and defaults to `gemini-3.5-flash-lite`; `GEMINI_FALLBACK_MODEL` defaults to `gemini-3.6-flash` when the primary model is unavailable or busy.

## CSV format

```csv
name,category,subcategory,stock,sellingPrice,costPrice,planningMethod,lowStockThreshold
Chicken Fillet,Food,Chicken,20,75,50,FORECAST_AI,5
Bottled Water,Drinks,Water,30,20,12,VMI,10
```

## Verification commands

```bash
npm run lint
npm run typecheck
npm run build
```

Known limitations are tracked in [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md). No real payments, GCash services, loans, banking transactions, server-side authentication, or customer tracking are implemented.
