import type { AppState, Product, Transaction } from "@/lib/types";

export const peso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
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

export const paidTransactions = (state: AppState) =>
  state.transactions.filter((transaction) => transaction.paymentStatus === "PAID");

export const todaySales = (state: AppState) => {
  const today = new Date().toDateString();
  return paidTransactions(state)
    .filter((transaction) => new Date(transaction.paidAt ?? transaction.createdAt).toDateString() === today)
    .reduce((sum, transaction) => sum + transaction.totalAmount, 0);
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
