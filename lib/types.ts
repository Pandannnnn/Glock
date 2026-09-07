export type PlanningMethod = "FORECAST_AI" | "VMI";
export type PaymentStatus = "PENDING" | "PAID" | "CANCELLED";
export type PaymentMethod = "GCASH" | "CASH";
export type ConnectionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RelationshipType = "SUPPLIER" | "BUYER" | "BOTH";
export type PlanSource = "FORECAST_AI" | "VMI";
export type DtiSrpTier = "LOWEST_SRP" | "BALANCED" | "PREMIUM";
export type DtiSrpMatch = "EXACT" | "CATEGORY_BENCHMARK" | "MARKET_REFERENCE";
export type AcquisitionCostBasis = "DTI_SRP" | "PRODUCT_COST_FALLBACK" | "MANUAL_OVERRIDE";
export type DemoAccountId = "merchant-main" | "vendor-kuya-mark";
export type ReservationStatus = "PENDING" | "FULFILLED" | "CANCELLED";

export interface DtiSrpProfile {
  key: string;
  matchLabel: string;
  matchType: DtiSrpMatch;
  unit: string;
  prices: Record<DtiSrpTier, number>;
  sourceLabel: string;
  sourceUrl?: string;
  asOf: string;
  note?: string;
}

export interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  personalFunds: number;
  personalCashOnHand: number;
  businessFunds: number;
  reservedBusinessFunds: number;
  cashOnHand: number;
  reservedCashFunds: number;
  glockEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  category: string;
  subcategory: string;
  stock: number;
  sellingPrice: number;
  costPrice: number;
  planningMethod: PlanningMethod;
  lowStockThreshold: number;
  isVisibleToConnectedBusinesses: boolean;
  vendorAvailableQuantity: number;
  vendorPrice?: number;
  dtiSrpProfileKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  merchantId: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receiptCode: string;
  cashReceived?: number;
  changeGiven?: number;
  profitAmount?: number;
  paidAt?: string;
  createdAt: string;
  items: TransactionItem[];
}

export interface Vendor {
  id: string;
  businessName: string;
  ownerName: string;
  status: ConnectionStatus;
  relationshipType: RelationshipType;
  createdAt: string;
  products: Product[];
}

export interface ReservedPlanItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  supplierName?: string;
  acquisitionCostBasis?: AcquisitionCostBasis;
  estimatedSrp?: number;
  srpMatch?: DtiSrpMatch;
  srpMatchLabel?: string;
  srpUnit?: string;
  srpSource?: string;
  srpSourceUrl?: string;
  srpAsOf?: string;
}

export interface ReservedPlan {
  id: string;
  merchantId: string;
  source: PlanSource;
  cardType: string;
  totalCost: number;
  status: "DRAFT" | "CONFIRMED" | "FULFILLED" | "CANCELLED";
  createdAt: string;
  sharedReservationId?: string;
  items: ReservedPlanItem[];
}

export interface SharedReservation {
  id: string;
  buyerMerchantId: DemoAccountId;
  buyerBusinessName: string;
  supplierMerchantId: DemoAccountId;
  supplierBusinessName: string;
  source: PlanSource;
  cardType: string;
  totalCost: number;
  gcashAmount: number;
  cashAmount: number;
  status: ReservationStatus;
  createdAt: string;
  items: ReservedPlanItem[];
}

export interface RadarTransaction {
  id: string;
  area: string;
  productName: string;
  category: string;
  quantity: number;
  purchaseTime: string;
  anonymizedMerchantType: string;
}

export interface AppState {
  merchant: Merchant;
  products: Product[];
  transactions: Transaction[];
  vendors: Vendor[];
  reservedPlans: ReservedPlan[];
  radarTransactions: RadarTransaction[];
  plannerUnlocked: boolean;
  lastReceiptId?: string;
}

export interface PlannerItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  supplierName?: string;
  acquisitionCostBasis?: AcquisitionCostBasis;
  estimatedSrp?: number;
  srpMatch?: DtiSrpMatch;
  srpMatchLabel?: string;
  srpUnit?: string;
  srpSource?: string;
  srpSourceUrl?: string;
  srpAsOf?: string;
}

export interface PlannerCard {
  id: string;
  source: PlanSource;
  cardType: string;
  label: string;
  badge: string;
  totalCost: number;
  supplierName: string;
  reason: string;
  items: PlannerItem[];
  srpSource?: string;
  srpSourceUrl?: string;
  srpAsOf?: string;
}
