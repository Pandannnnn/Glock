import type { AppState, PaymentMethod, Product, RadarTransaction, Transaction, Vendor } from "@/lib/types";

const iso = (daysAgo: number, hour = 12) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
};

const id = (prefix: string, index: number) => `${prefix}-${index}`;

const product = (input: Partial<Product> & Pick<Product, "name" | "category" | "subcategory">): Product => ({
  id: input.id ?? `product-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  merchantId: input.merchantId ?? "merchant-main",
  name: input.name,
  category: input.category,
  subcategory: input.subcategory,
  stock: input.stock ?? 10,
  sellingPrice: input.sellingPrice ?? 50,
  costPrice: input.costPrice ?? 30,
  planningMethod: input.planningMethod ?? "FORECAST_AI",
  lowStockThreshold: input.lowStockThreshold ?? 5,
  isVisibleToConnectedBusinesses: input.isVisibleToConnectedBusinesses ?? false,
  vendorAvailableQuantity: input.vendorAvailableQuantity ?? 0,
  vendorPrice: input.vendorPrice,
  createdAt: input.createdAt ?? iso(14),
  updatedAt: input.updatedAt ?? iso(0),
});

const tx = (index: number, daysAgo: number, items: Array<[string, string, number, number]>, paymentMethod: PaymentMethod = index % 2 === 1 ? "CASH" : "GCASH") : Transaction => {
  const totalAmount = items.reduce((sum, [, , quantity, unitPrice]) => sum + quantity * unitPrice, 0);
  const profitAmount = items.reduce((sum, [productId, , quantity, unitPrice]) => {
    const productRecord = mainProducts.find((product) => product.id === productId);
    return sum + (productRecord ? (unitPrice - productRecord.costPrice) * quantity : 0);
  }, 0);
  return {
    id: id("transaction", index),
    merchantId: "merchant-main",
    totalAmount,
    paymentMethod,
    paymentStatus: "PAID",
    receiptCode: `GLK-${String(2408 - daysAgo).slice(-2)}-${String(18 - index).padStart(3, "0")}`,
    cashReceived: paymentMethod === "CASH" ? totalAmount : undefined,
    changeGiven: paymentMethod === "CASH" ? 0 : undefined,
    profitAmount,
    paidAt: iso(daysAgo, 12 + (index % 6)),
    createdAt: iso(daysAgo, 11 + (index % 5)),
    items: items.map(([productId, productName, quantity, unitPrice], itemIndex) => ({ id: id(`item-${index}`, itemIndex), productId, productName, quantity, unitPrice, subtotal: quantity * unitPrice })),
  };
};

const vendorProduct = (vendorId: string, input: Partial<Product> & Pick<Product, "name" | "category" | "subcategory">) =>
  product({ ...input, id: input.id ?? `${vendorId}-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, merchantId: vendorId, planningMethod: "VMI", isVisibleToConnectedBusinesses: true });

const vendors: Vendor[] = [
  {
    id: "vendor-kuya-mark",
    businessName: "Kuya Mark Frozen Goods",
    ownerName: "Mark Villanueva",
    status: "APPROVED",
    relationshipType: "BOTH",
    createdAt: iso(28),
    products: [
      vendorProduct("vendor-kuya-mark", { name: "Frozen Siomai", category: "Frozen Goods", subcategory: "Ready-to-cook", stock: 120, costPrice: 78, sellingPrice: 110, vendorAvailableQuantity: 80, vendorPrice: 78 }),
      vendorProduct("vendor-kuya-mark", { name: "Chicken Fillet", category: "Food", subcategory: "Chicken", stock: 60, costPrice: 48, sellingPrice: 72, vendorAvailableQuantity: 35, vendorPrice: 48 }),
    ],
  },
  {
    id: "vendor-southside",
    businessName: "Southside Beverage Supplier",
    ownerName: "Nico Reyes",
    status: "APPROVED",
    relationshipType: "SUPPLIER",
    createdAt: iso(16),
    products: [
      vendorProduct("vendor-southside", { name: "Bottled Water", category: "Drinks", subcategory: "Water", stock: 300, costPrice: 10, sellingPrice: 18, vendorAvailableQuantity: 200, vendorPrice: 10 }),
      vendorProduct("vendor-southside", { name: "Iced Coffee", category: "Drinks", subcategory: "Coffee", stock: 100, costPrice: 25, sellingPrice: 48, vendorAvailableQuantity: 50, vendorPrice: 25 }),
    ],
  },
  {
    id: "vendor-minimart-pasig",
    businessName: "MiniMart Pasig",
    ownerName: "Aira Lim",
    status: "APPROVED",
    relationshipType: "BUYER",
    createdAt: iso(9),
    products: [
      vendorProduct("vendor-minimart-pasig", { name: "Rice 5kg", category: "Grocery", subcategory: "Staples", stock: 80, costPrice: 240, sellingPrice: 275, vendorAvailableQuantity: 30, vendorPrice: 240 }),
    ],
  },
  {
    id: "vendor-tita-lorna",
    businessName: "Tita Lorna Frozen Meat Supply",
    ownerName: "Lorna Garcia",
    status: "PENDING",
    relationshipType: "SUPPLIER",
    createdAt: iso(2),
    products: [
      vendorProduct("vendor-tita-lorna", { name: "Longganisa", category: "Frozen Goods", subcategory: "Ready-to-cook", stock: 90, costPrice: 95, sellingPrice: 135, vendorAvailableQuantity: 25, vendorPrice: 95 }),
    ],
  },
];

const mainProducts: Product[] = [
  product({ name: "Chicken Fillet", category: "Food", subcategory: "Chicken", stock: 7, sellingPrice: 75, costPrice: 50, planningMethod: "FORECAST_AI", lowStockThreshold: 10 }),
  product({ name: "Bottled Water", category: "Drinks", subcategory: "Water", stock: 30, sellingPrice: 20, costPrice: 12, planningMethod: "VMI", lowStockThreshold: 10, isVisibleToConnectedBusinesses: true, vendorAvailableQuantity: 24, vendorPrice: 12 }),
  product({ name: "Iced Coffee", category: "Drinks", subcategory: "Coffee", stock: 18, sellingPrice: 55, costPrice: 28, planningMethod: "FORECAST_AI", lowStockThreshold: 8 }),
  product({ name: "Frozen Siomai", category: "Frozen Goods", subcategory: "Ready-to-cook", stock: 5, sellingPrice: 120, costPrice: 82, planningMethod: "VMI", lowStockThreshold: 8, vendorAvailableQuantity: 35, vendorPrice: 82 }),
  product({ name: "Rice 5kg", category: "Grocery", subcategory: "Staples", stock: 12, sellingPrice: 285, costPrice: 248, planningMethod: "FORECAST_AI", lowStockThreshold: 5 }),
  product({ name: "Banana Cue", category: "Food", subcategory: "Street Food", stock: 24, sellingPrice: 35, costPrice: 18, planningMethod: "FORECAST_AI", lowStockThreshold: 12 }),
];

const transactions: Transaction[] = [
  tx(1, 0, [[mainProducts[0].id, mainProducts[0].name, 2, 75], [mainProducts[1].id, mainProducts[1].name, 1, 20], [mainProducts[2].id, mainProducts[2].name, 1, 55]]),
  tx(2, 0, [[mainProducts[3].id, mainProducts[3].name, 1, 120]]),
  tx(3, 1, [[mainProducts[5].id, mainProducts[5].name, 3, 35], [mainProducts[1].id, mainProducts[1].name, 2, 20]]),
  tx(4, 2, [[mainProducts[2].id, mainProducts[2].name, 3, 55]]),
  tx(5, 3, [[mainProducts[4].id, mainProducts[4].name, 1, 285], [mainProducts[1].id, mainProducts[1].name, 2, 20]]),
  tx(6, 4, [[mainProducts[0].id, mainProducts[0].name, 2, 75], [mainProducts[3].id, mainProducts[3].name, 1, 120]]),
  tx(7, 5, [[mainProducts[1].id, mainProducts[1].name, 4, 20], [mainProducts[5].id, mainProducts[5].name, 2, 35]]),
  tx(8, 6, [[mainProducts[2].id, mainProducts[2].name, 2, 55], [mainProducts[0].id, mainProducts[0].name, 1, 75]]),
  tx(9, 7, [[mainProducts[4].id, mainProducts[4].name, 1, 285], [mainProducts[5].id, mainProducts[5].name, 3, 35]]),
];

const radarRows: Array<[string, string, string, number, number, string]> = [
  ["Makati", "Chicken Fillet", "Food", 8, 16, "Food stall"],
  ["Makati", "Chicken Fillet", "Food", 12, 17, "Mini grocery"],
  ["Makati", "Chicken Fillet", "Food", 6, 16, "Sari-sari store"],
  ["Makati", "Iced Coffee", "Drinks", 14, 16, "Cafe kiosk"],
  ["Makati", "Iced Coffee", "Drinks", 10, 18, "Food stall"],
  ["Makati", "Bottled Water", "Drinks", 20, 12, "Sari-sari store"],
  ["Makati", "Bottled Water", "Drinks", 16, 14, "Mini grocery"],
  ["Makati", "Frozen Siomai", "Frozen Goods", 7, 15, "Mini grocery"],
  ["Makati", "Frozen Siomai", "Frozen Goods", 9, 17, "Food stall"],
];

const radarTransactions: RadarTransaction[] = radarRows.map(([area, productName, category, quantity, hour, anonymizedMerchantType], index) => ({ id: id("radar", index), area, productName, category, quantity, purchaseTime: iso(index + 1, hour), anonymizedMerchantType }));

export const createDefaultState = (): AppState => {
  const now = new Date().toISOString();
  return {
    merchant: { id: "merchant-main", businessName: "Kape Kubo Mini Mart", ownerName: "Maya Santos", personalFunds: 3200, personalCashOnHand: 0, businessFunds: 5000, reservedBusinessFunds: 1200, cashOnHand: 1800, reservedCashFunds: 0, glockEnabled: true, createdAt: iso(42), updatedAt: now },
    products: mainProducts,
    transactions,
    vendors,
    reservedPlans: [{ id: "plan-seeded", merchantId: "merchant-main", source: "VMI", cardType: "Southside essentials", totalCost: 1200, status: "CONFIRMED", createdAt: iso(1), items: [{ id: "plan-item-seeded", productName: "Bottled Water", quantity: 100, unitPrice: 12, subtotal: 1200, supplierName: "Southside Beverage Supplier" }] }],
    radarTransactions,
    plannerUnlocked: true,
    lastReceiptId: transactions[0].id,
  };
};

export const createKuyaMarkState = (): AppState => {
  const now = new Date().toISOString();
  const kuyaMarkVendor = vendors.find((vendor) => vendor.id === "vendor-kuya-mark");
  if (!kuyaMarkVendor) throw new Error("Seed vendor account is missing");

  return {
    merchant: {
      id: "vendor-kuya-mark",
      businessName: "Kuya Mark Frozen Goods",
      ownerName: "Mark Villanueva",
      personalFunds: 2800,
      personalCashOnHand: 450,
      businessFunds: 4200,
      reservedBusinessFunds: 0,
      cashOnHand: 2200,
      reservedCashFunds: 0,
      glockEnabled: true,
      createdAt: iso(42),
      updatedAt: now,
    },
    products: kuyaMarkVendor.products.map((product) => ({ ...product, merchantId: "vendor-kuya-mark", updatedAt: now })),
    transactions: [],
    vendors: [{
      id: "merchant-main",
      businessName: "Kape Kubo Mini Mart",
      ownerName: "Maya Santos",
      status: "APPROVED",
      relationshipType: "BUYER",
      createdAt: iso(28),
      products: [],
    }],
    reservedPlans: [],
    radarTransactions: radarTransactions.map((row) => ({ ...row })),
    plannerUnlocked: true,
  };
};
