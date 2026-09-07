import type { AppState, PaymentMethod, Product, Transaction } from "@/lib/types";

export const peso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

export const pesoPrecise = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const numberFormat = (amount: number) =>
  new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(amount);

export const shortDate = (date: string | Date) =>
  new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" }).format(new Date(date));

export const dateTime = (date: string | Date) =>
  new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));

export const timeOnly = (date: string | Date) =>
  new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit" }).format(new Date(date));

export const availableBusinessFunds = (state: AppState) =>
  Math.max(0, state.merchant.businessFunds - state.merchant.reservedBusinessFunds);

export const availableCashFunds = (state: AppState) =>
  Math.max(0, (state.merchant.cashOnHand ?? 0) - (state.merchant.reservedCashFunds ?? 0));

export const availableBusinessPurchasingFunds = (state: AppState) =>
  availableBusinessFunds(state) + availableCashFunds(state);

export const transactionPaymentMethod = (transaction: Transaction): PaymentMethod => transaction.paymentMethod ?? "GCASH";

export const paymentMethodLabel = (method: PaymentMethod) => method === "CASH" ? "Cash" : "GCash";

export const paidTransactions = (state: AppState) =>
  state.transactions.filter((transaction) => transaction.paymentStatus === "PAID");

export const transactionProfit = (state: AppState, transaction: Transaction) => {
  if (typeof transaction.profitAmount === "number") return transaction.profitAmount;
  return transaction.items.reduce((sum, item) => {
    const product = item.productId ? state.products.find((candidate) => candidate.id === item.productId) : undefined;
    return sum + (product ? item.subtotal - product.costPrice * item.quantity : 0);
  }, 0);
};

export const todayPaidTransactions = (state: AppState) => {
  const today = new Date().toDateString();
  return paidTransactions(state).filter((transaction) => new Date(transaction.paidAt ?? transaction.createdAt).toDateString() === today);
};

export const todaySalesByPaymentMethod = (state: AppState) => todayPaidTransactions(state).reduce<Record<PaymentMethod, number>>((result, transaction) => {
  const method = transactionPaymentMethod(transaction);
  result[method] += transaction.totalAmount;
  return result;
}, { GCASH: 0, CASH: 0 });

export const todayProfitByPaymentMethod = (state: AppState) => todayPaidTransactions(state).reduce<Record<PaymentMethod, number>>((result, transaction) => {
  const method = transactionPaymentMethod(transaction);
  result[method] += transactionProfit(state, transaction);
  return result;
}, { GCASH: 0, CASH: 0 });

export const todaySales = (state: AppState) => {
  return todayPaidTransactions(state).reduce((sum, transaction) => sum + transaction.totalAmount, 0);
};

export const weeklySales = (state: AppState) => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return paidTransactions(state)
    .filter((transaction) => new Date(transaction.paidAt ?? transaction.createdAt).getTime() >= cutoff)
    .reduce((sum, transaction) => sum + transaction.totalAmount, 0);
};

export const lowStockProducts = (products: Product[]) =>
  products.filter((product) => product.stock <= product.lowStockThreshold);

export const categoryOptions = (products: Product[]) =>
  Array.from(new Set(products.map((product) => product.category))).sort();

export const subcategoryOptions = (products: Product[], category?: string) =>
  Array.from(new Set(products.filter((product) => !category || product.category === category).map((product) => product.subcategory))).sort();

export const distinctSalesDays = (state: AppState) =>
  new Set(paidTransactions(state).map((transaction) => new Date(transaction.paidAt ?? transaction.createdAt).toDateString())).size;

export const initials = (value: string) => value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
