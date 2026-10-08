import type { DtiSrpProfile, DtiSrpTier, PlannerCard, PlannerItem, Product } from "@/lib/types";

export const DTI_BNPC_SRP_SOURCE_URL = "https://www.dti.gov.ph/wp-content/uploads/2025/08/BNPCSRPBULLETIN01FEBRUARY2025.002.pdf";
export const DTI_BNPC_SRP_AS_OF = "2025-02-01";

const roundMoney = (value: number) => Math.round(value * 100) / 100;

// The DTI bulletin lists several coffee 3-in-1 brands and pack sizes. Because the
// prototype's Iced Coffee item does not carry a brand or pack size, this is exposed
// as a category benchmark instead of pretending it is an exact product match.
const coffee3In1Prices = [4.5, 4.7, 7, 7.75, 8.25, 8.5];
const coffee3In1Average = roundMoney(coffee3In1Prices.reduce((sum, price) => sum + price, 0) / coffee3In1Prices.length);

export const dtiSrpProfiles: Record<string, DtiSrpProfile> = {
  "coffee-3-in-1": {
    key: "coffee-3-in-1",
    matchLabel: "Coffee 3-in-1 category benchmark",
    matchType: "CATEGORY_BENCHMARK",
    unit: "17–33g sachet/twin pack",
    prices: {
      LOWEST_SRP: Math.min(...coffee3In1Prices),
      BALANCED: coffee3In1Average,
      PREMIUM: Math.max(...coffee3In1Prices),
    },
    sourceLabel: "DTI BNPC SRP Bulletin",
    sourceUrl: DTI_BNPC_SRP_SOURCE_URL,
    asOf: DTI_BNPC_SRP_AS_OF,
    note: "Brand and pack size were not supplied, so the three values are a DTI category benchmark.",
  },
};

type SourcedProduct = Pick<Product, "id" | "name" | "category" | "subcategory"> & { dtiSrpProfileKey?: string };

export function getDtiSrpProfile(product: SourcedProduct): DtiSrpProfile | undefined {
  if (product.dtiSrpProfileKey && dtiSrpProfiles[product.dtiSrpProfileKey]) {
    return dtiSrpProfiles[product.dtiSrpProfileKey];
  }

  const name = product.name.toLowerCase();
  const category = product.category.toLowerCase();
  const subcategory = product.subcategory.toLowerCase();
  const isCoffee = name.includes("coffee") || name.includes("3-in-1") || subcategory.includes("coffee") || (category.includes("drink") && name.includes("coffee"));
  return isCoffee ? dtiSrpProfiles["coffee-3-in-1"] : undefined;
}

export const forecastCardDefinitions: Array<{
  cardType: DtiSrpTier;
  label: string;
  badge: string;
  defaultReason: string;
}> = [
  {
    cardType: "LOWEST_SRP",
    label: "Tipid Plan",
    badge: "Lowest DTI SRP",
    defaultReason: "Uses the lowest matched DTI SRP while keeping the same demand-led quantity recommendation.",
  },
  {
    cardType: "BALANCED",
    label: "Balanced Plan",
    badge: "Prevailing / Average DTI SRP",
    defaultReason: "Uses the prevailing or average DTI SRP for a practical acquisition-cost estimate.",
  },
  {
    cardType: "PREMIUM",
    label: "High Availability Plan",
    badge: "Highest DTI SRP",
    defaultReason: "Uses the highest matched DTI SRP to plan for a higher acquisition-cost case.",
  },
];

type ForecastProduct = SourcedProduct & {
  costPrice: number;
};

export type ForecastQuantityRecommendation = {
  productId: string;
  quantity: number;
};

function fallbackAcquisitionCost(product: ForecastProduct) {
  return Math.max(0.01, roundMoney(product.costPrice));
}

function forecastItem(product: ForecastProduct, recommendation: ForecastQuantityRecommendation, cardType: DtiSrpTier): PlannerItem {
  const profile = getDtiSrpProfile(product);
  const unitPrice = profile ? profile.prices[cardType] : fallbackAcquisitionCost(product);
  const quantity = Math.max(1, Math.round(recommendation.quantity));
  return {
    id: `forecast-${product.id}`,
    productName: product.name,
    quantity,
    unitPrice,
    subtotal: quantity * unitPrice,
    acquisitionCostBasis: profile ? "DTI_SRP" : "PRODUCT_COST_FALLBACK",
    ...(profile ? {
      estimatedSrp: unitPrice,
      srpMatch: profile.matchType,
      srpMatchLabel: profile.matchLabel,
      srpUnit: profile.unit,
      srpSource: profile.sourceLabel,
      srpSourceUrl: profile.sourceUrl,
      srpAsOf: profile.asOf,
    } : {}),
  };
}

export function buildDtiForecastCards(
  products: ForecastProduct[],
  recommendations: ForecastQuantityRecommendation[],
  reasons: Partial<Record<DtiSrpTier, string>> = {},
): PlannerCard[] {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const seenProductIds = new Set<string>();
  const sharedRecommendations = recommendations.flatMap((recommendation) => {
    const productId = recommendation.productId;
    const product = productsById.get(productId);
    if (!product || seenProductIds.has(productId)) return [];
    const quantity = Math.min(10000, Math.max(1, Math.round(recommendation.quantity)));
    if (!quantity) return [];
    seenProductIds.add(productId);
    return [{ productId, quantity }];
  });

  if (!sharedRecommendations.length) return [];

  return forecastCardDefinitions.map((definition) => {
    const items = sharedRecommendations.map((recommendation) => forecastItem(productsById.get(recommendation.productId)!, recommendation, definition.cardType));
    const sourcedItem = items.find((item) => item.srpSource);
    return {
      id: `forecast-${definition.cardType}`,
      source: "FORECAST_AI" as const,
      cardType: definition.cardType,
      label: definition.label,
      badge: definition.badge,
      totalCost: items.reduce((sum, item) => sum + item.subtotal, 0),
      // The source is intentionally the same for every card. Only the SRP tier
      // changes; the recommendation and its quantities stay shared.
      supplierName: "Recommended supplier mix",
      reason: reasons[definition.cardType]?.trim().slice(0, 500) || definition.defaultReason,
      items,
      ...(sourcedItem ? {
        srpSource: sourcedItem.srpSource,
        srpSourceUrl: sourcedItem.srpSourceUrl,
        srpAsOf: sourcedItem.srpAsOf,
      } : {}),
    };
  });
}
