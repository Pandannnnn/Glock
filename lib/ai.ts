import { buildDtiForecastCards, type ForecastQuantityRecommendation } from "@/lib/dti-srp";
import type { AppState, DtiSrpTier, PlannerCard, PlannerItem, Product } from "@/lib/types";
import { availableBusinessPurchasingFunds, lowStockProducts, peso, todaySales, todaySalesByPaymentMethod } from "@/lib/format";

const replenishQuantity = (product: Product) =>
  Math.max(2, Math.ceil(product.lowStockThreshold * 2 - product.stock));

const fitItemsToBudget = (items: PlannerItem[], budget: number): PlannerItem[] => {
  let remaining = Math.max(0, budget);
  return items.flatMap((item) => {
    const affordableQuantity = Math.min(item.quantity, Math.floor(remaining / item.unitPrice));
    if (affordableQuantity <= 0) return [];
    remaining -= affordableQuantity * item.unitPrice;
    return [{ ...item, quantity: affordableQuantity, subtotal: affordableQuantity * item.unitPrice }];
  });
};

export function generateForecastCards(state: AppState): PlannerCard[] {
  const forecastProducts = state.products.filter((product) => product.planningMethod === "FORECAST_AI");
  const lowStock = lowStockProducts(forecastProducts);
  const recentUnitsSold = state.transactions.reduce<Record<string, number>>((result, transaction) => {
    if (transaction.paymentStatus !== "PAID") return result;
    transaction.items.forEach((item) => {
      if (item.productId) result[item.productId] = (result[item.productId] ?? 0) + item.quantity;
    });
    return result;
  }, {});
  const demandRanked = [...forecastProducts].sort((a, b) => (recentUnitsSold[b.id] ?? 0) - (recentUnitsSold[a.id] ?? 0));
  const selected = Array.from(new Map([...lowStock, ...demandRanked].map((product) => [product.id, product])).values()).slice(0, 3);
  const budget = availableBusinessPurchasingFunds(state);
  const baseItems = selected.map((product) => ({
    id: `forecast-${product.id}`,
    productName: product.name,
    quantity: replenishQuantity(product),
    unitPrice: Math.max(0.01, product.costPrice),
    subtotal: replenishQuantity(product) * Math.max(0.01, product.costPrice),
  }));
  const sharedItems = fitItemsToBudget(baseItems, budget);
  const recommendations: ForecastQuantityRecommendation[] = sharedItems.map((item) => ({
    productId: item.id.replace(/^forecast-/, ""),
    quantity: item.quantity,
  }));
  const reasons: Partial<Record<DtiSrpTier, string>> = {
    LOWEST_SRP: "The same demand-led replenishment quantities are priced with the lowest matched DTI SRP to keep the plan as lean as possible.",
    BALANCED: "The same demand-led replenishment quantities are priced with the prevailing or average matched DTI SRP for a practical middle estimate.",
    PREMIUM: "The same demand-led replenishment quantities are priced with the highest matched DTI SRP to show the higher acquisition-cost case.",
  };
  return buildDtiForecastCards(forecastProducts, recommendations, reasons);
}

export function generateVmiCards(state: AppState): PlannerCard[] {
  const needs = lowStockProducts(state.products).filter((product) => product.planningMethod === "VMI");
  return state.vendors
    .filter((vendor) => vendor.status === "APPROVED" && (vendor.relationshipType === "SUPPLIER" || vendor.relationshipType === "BOTH"))
    .map((vendor) => {
      const items: PlannerItem[] = [];
      for (const need of needs) {
        const vendorProduct = vendor.products.find((candidate) => candidate.name === need.name && candidate.isVisibleToConnectedBusinesses && candidate.vendorAvailableQuantity > 0);
        if (!vendorProduct) continue;
        const quantity = Math.min(vendorProduct.vendorAvailableQuantity, Math.max(2, need.lowStockThreshold * 2 - need.stock));
        const unitPrice = vendorProduct.vendorPrice ?? vendorProduct.costPrice;
        items.push({ id: `vmi-${vendor.id}-${need.id}`, productName: need.name, quantity, unitPrice, subtotal: quantity * unitPrice, supplierName: vendor.businessName });
      }
      return { vendor, items: fitItemsToBudget(items, availableBusinessPurchasingFunds(state)) };
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

export function generateAdaptiveSplit(state: AppState, personalPercentOverride?: number) {
  const sales = todaySales(state);
  const revenueBySource = todaySalesByPaymentMethod(state);
  const estimatedRevenue = revenueBySource.CASH + revenueBySource.GCASH || sales;
  const lowStockCount = lowStockProducts(state.products).length;
  const recommendedPersonalPercent = lowStockCount >= 2 ? 30 : 45;
  const personalPercent = Math.max(0, Math.min(80, personalPercentOverride ?? recommendedPersonalPercent));
  const businessPercent = 100 - personalPercent;
  const personalAmount = Math.round(estimatedRevenue * personalPercent / 100);
  const sourceRevenueTotal = revenueBySource.CASH + revenueBySource.GCASH;
  const cashShare = sourceRevenueTotal > 0 ? revenueBySource.CASH / sourceRevenueTotal : 0;
  const cashPersonalAmount = Math.round(personalAmount * cashShare);
  const gcashPersonalAmount = personalAmount - cashPersonalAmount;
  return {
    estimatedRevenue,
    revenueBySource,
    personalPercent,
    businessPercent,
    personalAmount,
    businessAmount: estimatedRevenue - personalAmount,
    cashPersonalAmount,
    cashBusinessAmount: Math.max(0, revenueBySource.CASH - cashPersonalAmount),
    gcashPersonalAmount,
    gcashBusinessAmount: Math.max(0, revenueBySource.GCASH - gcashPersonalAmount),
    reason: lowStockCount >= 2
      ? `Inventory is running low on ${lowStockCount} items and demand is expected to stay active tomorrow. Keep more revenue in Business Funds for restocking.`
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
  const funds = availableBusinessPurchasingFunds(state);
  return `${peso(funds)} combined funds available for the next plan`;
}
