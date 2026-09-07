# GLock Demo Script

## 3-minute flow

### 0:00-0:25 - Set the context

Open `/`.

Say: "GLock is a merchant workspace concept inside a familiar GCash-style shell. It separates Personal Funds from Business Funds, then connects sales to inventory decisions. Everything today is simulated."

Point to the total balance, Personal Funds, Business Funds, and the `Prototype only` label.

### 0:25-0:45 - Find GLock

Click **Explore more services** or **GCash home**, then open `/view-more`.

Say: "A merchant discovers GLock from View More. This seeded demo already has a merchant, so I can open the workspace. The Reconfigure merchant link is the onboarding path."

If the dashboard opens at the sign-in screen, use the seeded Kape Kubo account: `maya` / `maya123`. The second account is `kuya.mark` / `kuya123`.

### 0:45-1:30 - Prove the cashier loop

Click **Open GLock**, stay on **Overview**, select Chicken Fillet and Iced Coffee, then click **Generate mock QR** and **Simulate Payment**.

Say: "This is a transaction-specific mock QR. When the simulated payment succeeds, Business Funds increase, stock decreases, and a compact receipt combines payment details with the order."

Point to the updated funds, receipt code, paid status, and low-stock list.

### 1:30-2:20 - Prove planning and funds discipline

Open **Planner**. Adjust the Adaptive Split slider, then show Tipid Plan, Balanced Plan, High Availability Plan, and VMI cards. Edit a quantity if useful and confirm one plan.

Say: "GLock turns low-stock and demand signals into one replenishment recommendation. Forecast AI shows the same items and quantities under three DTI SRP acquisition-cost views; VMI points to approved merchant partners. Each card shows its Cash and GCash funding split. Confirming a plan reserves Business Funds and reduces Available Funds. The app blocks plans that exceed the available balance."

### 2:20-3:00 - Prove network and privacy

Open **Connected Businesses**, show approved vendors and visible inventory. Then open **GRadar**.

Say: "Connected Businesses makes the supply relationship explicit. GRadar only shows aggregated product, quantity, category, and time signals. It never exposes customer identity, phone numbers, account numbers, or exact merchant revenue."

### Optional account-to-account handoff

1. Sign in as `maya` / `maya123` and open Planner.
2. Confirm a VMI card supplied by **Kuya Mark Frozen Goods**.
3. Use **Switch account**, then sign in as `kuya.mark` / `kuya123`.
4. Open **Connected Businesses**, expand the closed **Reservations** dropdown, then click **Fulfill** on the pending reservation.

Say: "This is a shared simulation of the merchant handoff: the buyer reserves Business GCash and cash, the supplier sees the order, and fulfillment settles both sides' inventory and funds."

## 5-minute flow

Add this onboarding section before the three-minute flow:

1. From `/view-more`, click **Reconfigure merchant**.
2. Enter a business name, owner name, Personal Funds, and Business Funds.
3. Continue to products, add a product manually, and set `Forecast AI` or `VMI`.
4. Upload the sample CSV from the README and explain that rows are parsed locally.
5. Create the workspace and land on the dashboard.

Then show the full 3-minute flow, adding:

- **Products**: search, category filtering, edit, delete, and partner visibility.
- **Connected Businesses**: approve the pending mock request and configure shared quantity/price.
- **GRadar**: filter a product and compare demand-over-time, supply-vs-demand, and peak-time charts.

## Suggested speaking points

- "The key product idea is a closed loop: payment signal -> stock change -> planning decision -> reserved business funds."
- "This is designed for small merchants who may not have a separate inventory system."
- "VMI is merchant-to-merchant supply, not a public marketplace."
- "GRadar is intentionally aggregated and consent-safe."
- "Prototype labels are visible because this demo does not move real money."

## Exact screens and what they prove

| Screen | Action | What it proves |
| --- | --- | --- |
| `/` | Show wallets | GCash-inspired entry point and fund separation |
| `/view-more` | Open GLock | Product discovery inside the simulated shell |
| `/glock/onboarding` | Add/import products | Merchant setup and planning method choice |
| Dashboard > Overview | Simulate Payment | QR, receipt, Business Funds, and stock mutation |
| Dashboard > Products | Edit/search/share | Inventory control and partner visibility |
| Dashboard > Planner | Confirm a card | Forecast/VMI recommendations and reserved funds |
| Dashboard > Connected Businesses | Approve vendor | Merchant-to-merchant supply relationship |
| Dashboard > GRadar | Filter and chart | Privacy-safe aggregated demand intelligence |

## Backup path if a feature breaks

- If onboarding is risky during the live demo, use the seeded merchant and click **Reset** in the header.
- If Gemini is unavailable, continue; the deterministic `Demo AI` fallback is the intended default.
- If a QR interaction is unreliable, explain the Mock QR and use the already visible receipt/history cards; no real payment is expected.
- If Planner is locked after a fresh onboarding, click **Simulate 1 week of sales data**.
- If VMI cards are empty, reset the demo, confirm the vendor is approved, and use the seeded Frozen Siomai low-stock item.
- If time runs short, skip onboarding and Connected Businesses; the seeded dashboard still demonstrates the core loop.
