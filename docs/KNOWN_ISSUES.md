# Known Issues and Demo Risks

## Current bugs found

No blocking bugs were found in the stabilization pass. The following checks passed:

- `npm install`
- `npm run db:generate`
- `npm run db:push`
- `npm run db:seed`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Production route smoke tests for `/`, `/view-more`, `/glock/onboarding`, and `/glock/dashboard`

## Prototype limitations

1. The working browser UI uses `localStorage`; Prisma/SQLite is a valid schema and seed path but is not the runtime source for dashboard actions.
2. There is no authentication, merchant account isolation, server authorization, or audit trail.
3. The default client snapshot starts with GLock enabled and Planner unlocked to make a judge demo fast. Use **Reconfigure merchant** to show onboarding.
4. The UI has no automated browser flow or visual regression suite yet.
5. The dashboard client is intentionally dense because it packs all demo tabs into one route.
6. The Prisma schema uses string status fields because SQLite does not support Prisma enum declarations in the configured connector.

## Simulated features

- QR values and payments
- GLoan option
- Adaptive Split action
- Forecast AI and VMI buying recommendations
- Gemini output when configured
- Connected merchant relationships and vendor inventory
- GRadar network data

## Risks before demo day

### High priority

- Browser state can be stale if a previous demo session left unexpected `localStorage` data. Click **Reset** before presenting.
- The UI store and Prisma seed path can diverge. Do not describe the current demo as server-persisted.
- GitHub/CI environments must have Node.js and npm available; PowerShell users may need `npm.cmd` if script execution is restricted.

### Medium priority

- Optional Gemini calls add network latency; do not wait for them during the live demo.
- Planner cards are guarded at confirmation time. They can still be rendered as unaffordable after funds change, which is safe but less polished than pre-filtering them.
- The layout has been checked through responsive CSS and production rendering, but not through device automation.

### Low priority

- `npm install` currently reports upstream dependency audit warnings. Avoid a major dependency upgrade immediately before the presentation.
- The app has no formal unit tests for financial state transitions.

## Suggested fixes in priority order

1. Add Playwright or Vitest coverage for payment, stock, reservation, and onboarding transitions.
2. Move the browser store behind typed route handlers backed by Prisma.
3. Filter or label unaffordable cards before they render.
4. Add a versioned demo-state reset and a visible `last reset` timestamp.
5. Resolve dependency audit warnings in a separate upgrade branch.
