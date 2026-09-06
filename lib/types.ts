export type PlanningMethod = "FORECAST_AI" | "VMI";
export type PaymentStatus = "PENDING" | "PAID" | "CANCELLED";
export type ConnectionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RelationshipType = "SUPPLIER" | "BUYER" | "BOTH";
export type PlanSource = "FORECAST_AI" | "VMI";

export interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  personalFunds: number;
  businessFunds: number;
  reservedBusinessFunds: number;
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
  paymentStatus: PaymentStatus;
  receiptCode: string;
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
}

export interface ReservedPlan {
  id: string;
  merchantId: string;
  source: PlanSource;
  cardType: string;
  totalCost: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
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
}
