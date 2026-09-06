# GLock Merchant Prototype

GLock is a GCash-inspired merchant workspace concept for the GCash iMAGination 2026 hackathon. It helps Filipino small merchants separate business funds, track inventory, simulate QR sales, plan restocking, connect with vendors, and view privacy-safe demand signals.

This is a prototype only: data is seeded or simulated, QR payments do not move money, and no official GCash assets or integrations are used.

For the detailed architecture and contribution notes, see [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md). For the judge-facing walkthrough, see [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## Run locally

This repository uses npm. If PowerShell blocks `npm.ps1`, use `npm.cmd` or set `RemoteSigned` for your current user.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

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

`GEMINI_API_KEY` enables the server-side bridge at `/api/ai`. Without it, GLock uses deterministic rule-based fallback recommendations and remains usable offline.

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

Known limitations are tracked in [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md). No real payments, GCash services, loans, banking transactions, authentication, or customer tracking are implemented.
