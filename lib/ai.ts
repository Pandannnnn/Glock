import type { AppState, PlannerCard, PlannerItem, Product } from "@/lib/types";
import { availableBusinessFunds, lowStockProducts, peso, todaySales } from "@/lib/format";

const replenishQuantity = (product: Product, multiplier = 1) =>
  Math.max(2, Math.ceil((product.lowStockThreshold * 2 - product.stock) * multiplier));

const forecastItems = (products: Product[], multiplier: number, priceMultiplier: number): PlannerItem[] =>
  products.map((product) => {
    const quantity = replenishQuantity(product, multiplier);
    const unitPrice = Math.round(product.costPrice * priceMultiplier);
    return { id: `forecast-${product.id}`, productName: product.name, quantity, unitPrice, subtotal: quantity * unitPrice };
  });

export function generateForecastCards(state: AppState): PlannerCard[] {
  const products = lowStockProducts(state.products).filter((product) => product.planningMethod === "FORECAST_AI");
  const fallbackProducts = state.products.filter((product) => product.planningMethod === "FORECAST_AI").slice(0, 2);
  const selected = products.length ? products : fallbackProducts;
  const cards = [
    { cardType: "LOWEST_SRP", label: "Budget", badge: "Lowest SRP", multiplier: 0.75, priceMultiplier: 0.92, supplierName: "Divisoria Wholesale Hub", reason: "Keeps more funds available while covering the most urgent low-stock items." },
    { cardType: "BALANCED", label: "Balanced", badge: "Average SRP", multiplier: 1, priceMultiplier: 1, supplierName: "Makati Public Market", reason: "Balances tomorrow’s expected demand with a comfortable cash buffer." },
    { cardType: "PREMIUM", label: "Premium", badge: "Highest SRP", multiplier: 1.3, priceMultiplier: 1.12, supplierName: "FreshLane Select", reason: "Adds a little extra safety stock for high-demand windows and better quality." },
  ].map((card) => {
    const items = forecastItems(selected, card.multiplier, card.priceMultiplier);
    return { id: `forecast-${card.cardType}`, source: "FORECAST_AI" as const, cardType: card.cardType, label: card.label, badge: card.badge, totalCost: items.reduce((sum, item) => sum + item.subtotal, 0), supplierName: card.supplierName, reason: card.reason, items };
  });
  return cards;
}

export function generateVmiCards(state: AppState): PlannerCard[] {
  const needs = lowStockProducts(state.products).filter((product) => product.planningMethod === "VMI");
  return state.vendors
    .filter((vendor) => vendor.status === "APPROVED" && (vendor.relationshipType === "SUPPLIER" || vendor.relationshipType === "BOTH"))
    .map((vendor) => {
      const items: PlannerItem[] = [];
      for (const need of needs) {
        const vendorProduct = vendor.products.find((candidate) => candidate.name === need.name && candidate.isVisibleToConnectedBusinesses && (candidate.vendorAvailableQuantity || candidate.stock) > 0);
        if (!vendorProduct) continue;
        const quantity = Math.min(vendorProduct.vendorAvailableQuantity || vendorProduct.stock, Math.max(2, need.lowStockThreshold * 2 - need.stock));
        const unitPrice = vendorProduct.vendorPrice ?? vendorProduct.costPrice;
        items.push({ id: `vmi-${vendor.id}-${need.id}`, productName: need.name, quantity, unitPrice, subtotal: quantity * unitPrice, supplierName: vendor.businessName });
      }
      return { vendor, items };
    })
    .filter(({ items }) => items.length > 0)
    .map(({ vendor, items }) => ({
      id: `vmi-${vendor.id}`,
      source: "VMI" as const,
      cardType: "VENDOR",
      label: vendor.businessName,
      badge: vendor.relationshipType === "BOTH" ? "Trusted partner" : "Approved supplier",
      totalCost: items.reduce((sum, item) => sum + item.subtotal, 0),
      supplierName: vendor.businessName,
      reason: `Matches ${items.length} VMI item${items.length === 1 ? "" : "s"} to visible inventory from an approved connection.`,
      items,
    }));
}

export function generateAdaptiveSplit(state: AppState) {
  const sales = todaySales(state);
  const estimatedProfit = Math.round(sales * 0.42);
  const lowStockCount = lowStockProducts(state.products).length;
  const personalPercent = lowStockCount >= 2 ? 30 : 45;
  const businessPercent = 100 - personalPercent;
  return {
    estimatedProfit,
    personalPercent,
    businessPercent,
    personalAmount: Math.round(estimatedProfit * personalPercent / 100),
    businessAmount: Math.round(estimatedProfit * businessPercent / 100),
    reason: lowStockCount >= 2
      ? `Inventory is running low on ${lowStockCount} items and demand is expected to stay active tomorrow. Keep more profit in Business Funds for restocking.`
      : "Sales are steady. This split gives you a personal cash-out while preserving a healthy operating buffer.",
  };
}

export function generatePlannerExplanation(state: AppState) {
  return generateAdaptiveSplit(state).reason;
}

export function generateRadarSummary(state: AppState) {
  const grouped = state.radarTransactions.reduce<Record<string, number>>((result, row) => { result[row.productName] = (result[row.productName] ?? 0) + row.quantity; return result; }, {});
  const top = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
  return top ? `${top[0]} is the strongest nearby signal this week with ${top[1]} anonymized units observed. Consider restocking before the late-afternoon rush.` : "Nearby demand is still building. Keep watching the next few days of aggregated signals.";
}

export function plannerDataLabel(state: AppState) {
  const funds = availableBusinessFunds(state);
  return `${peso(funds)} available for the next plan`;
}
