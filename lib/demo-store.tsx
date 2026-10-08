"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createDefaultState, createKuyaMarkState } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth";
import type { AppState, DemoAccountId, ReservationStatus, ReservedPlanItem, SharedReservation } from "@/lib/types";

const STORAGE_KEY = "glock-demo-workspace-v2";
const LEGACY_STORAGE_KEY = "glock-demo-state-v1";

type AccountStates = Record<DemoAccountId, AppState>;

interface DemoWorkspace {
  accounts: AccountStates;
  reservations: SharedReservation[];
}

function cloneState(state: AppState): AppState {
  return {
    ...state,
    merchant: { ...state.merchant },
    products: state.products.map((product) => ({ ...product })),
    transactions: state.transactions.map((transaction) => ({ ...transaction, items: transaction.items.map((item) => ({ ...item })) })),
    vendors: state.vendors.map((vendor) => ({ ...vendor, products: vendor.products.map((product) => ({ ...product })) })),
    reservedPlans: state.reservedPlans.map((plan) => ({ ...plan, items: plan.items.map((item) => ({ ...item })) })),
    radarTransactions: state.radarTransactions.map((row) => ({ ...row })),
  };
}

function normalizeState(saved: Partial<AppState>, fallback: AppState): AppState {
  const merchant = { ...fallback.merchant, ...(saved.merchant ?? {}) };
  return {
    ...cloneState(fallback),
    ...saved,
    merchant: {
      ...merchant,
      personalCashOnHand: merchant.personalCashOnHand ?? 0,
      cashOnHand: merchant.cashOnHand ?? 0,
      reservedCashFunds: merchant.reservedCashFunds ?? 0,
    },
    transactions: (saved.transactions ?? fallback.transactions).map((transaction) => ({
      ...transaction,
      paymentMethod: transaction.paymentMethod ?? "GCASH",
    })),
  };
}

function createDefaultWorkspace(): DemoWorkspace {
  return {
    accounts: {
      "merchant-main": cloneState(createDefaultState()),
      "vendor-kuya-mark": cloneState(createKuyaMarkState()),
    },
    reservations: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeReservations(value: unknown): SharedReservation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    if (typeof candidate.id !== "string"
      || typeof candidate.buyerMerchantId !== "string"
      || typeof candidate.supplierMerchantId !== "string"
      || typeof candidate.status !== "string"
      || !Array.isArray(candidate.items)) return [];
    const status = candidate.status === "RESERVED" || candidate.status === "ACCEPTED" ? "PENDING" : candidate.status;
    if (status !== "PENDING" && status !== "FULFILLED" && status !== "CANCELLED") return [];
    return [{ ...candidate, status } as SharedReservation];
  });
}

function normalizeWorkspace(value: unknown): DemoWorkspace {
  const defaults = createDefaultWorkspace();
  if (!isRecord(value)) return defaults;

  if (isRecord(value.accounts)) {
    const accounts = value.accounts;
    const mainAccount = isRecord(accounts["merchant-main"]) ? accounts["merchant-main"] as Partial<AppState> : {};
    const kuyaMarkAccount = isRecord(accounts["vendor-kuya-mark"]) ? accounts["vendor-kuya-mark"] as Partial<AppState> : {};
    return {
      accounts: {
        "merchant-main": normalizeState(mainAccount, defaults.accounts["merchant-main"]),
        "vendor-kuya-mark": normalizeState(kuyaMarkAccount, defaults.accounts["vendor-kuya-mark"]),
      },
      reservations: normalizeReservations(value.reservations),
    };
  }

  // Migrate the original single-account browser snapshot into Maya's account.
  return {
    accounts: {
      "merchant-main": normalizeState(value as Partial<AppState>, defaults.accounts["merchant-main"]),
      "vendor-kuya-mark": defaults.accounts["vendor-kuya-mark"],
    },
    reservations: [],
  };
}

function adjustVendorAvailability(accounts: AccountStates, supplierMerchantId: DemoAccountId, items: ReservedPlanItem[], direction: 1 | -1): AccountStates {
  const quantities = items.reduce<Record<string, number>>((result, item) => {
    result[item.productName] = (result[item.productName] ?? 0) + item.quantity;
    return result;
  }, {});

  return (Object.keys(accounts) as DemoAccountId[]).reduce<AccountStates>((result, accountId) => {
    const account = accounts[accountId];
    const updateProductAvailability = (product: AppState["products"][number]) => {
      const quantity = quantities[product.name];
      if (!quantity) return product;
      return { ...product, vendorAvailableQuantity: Math.max(0, (product.vendorAvailableQuantity ?? 0) + direction * quantity), updatedAt: new Date().toISOString() };
    };
    result[accountId] = {
      ...account,
      products: accountId === supplierMerchantId ? account.products.map(updateProductAvailability) : account.products,
      vendors: account.vendors.map((vendor) => vendor.id === supplierMerchantId
        ? {
            ...vendor,
            products: vendor.products.map((product) => {
              const quantity = quantities[product.name];
              if (!quantity) return product;
              return { ...product, vendorAvailableQuantity: Math.max(0, (product.vendorAvailableQuantity ?? 0) + direction * quantity), updatedAt: new Date().toISOString() };
            }),
          }
        : vendor),
    };
    return result;
  }, { ...accounts });
}

function updatePlanStatus(state: AppState, reservationId: string, status: Extract<ReservationStatus, "FULFILLED" | "CANCELLED">): AppState {
  return {
    ...state,
    reservedPlans: state.reservedPlans.map((plan) => plan.sharedReservationId === reservationId ? { ...plan, status } : plan),
  };
}

interface DemoContextValue {
  state: AppState;
  accountId: DemoAccountId;
  hydrated: boolean;
  reservations: SharedReservation[];
  updateState: (updater: AppState | ((current: AppState) => AppState)) => void;
  createReservation: (reservation: SharedReservation) => void;
  updateReservationStatus: (reservationId: string, status: ReservationStatus) => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<DemoWorkspace>(() => createDefaultWorkspace());
  const [hydrated, setHydrated] = useState(false);
  const accountId: DemoAccountId = user?.accountId ?? "merchant-main";
  const state = workspace.accounts[accountId];

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) setWorkspace(normalizeWorkspace(JSON.parse(saved) as unknown));
    } catch {
      // A broken local demo snapshot should never stop the prototype from opening.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [hydrated, workspace]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setWorkspace(normalizeWorkspace(JSON.parse(event.newValue) as unknown));
      } catch {
        // Ignore an incomplete cross-tab update.
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo<DemoContextValue>(() => ({
    state,
    accountId,
    hydrated,
    reservations: workspace.reservations,
    updateState: (updater) => setWorkspace((current) => {
      const currentState = current.accounts[accountId];
      const nextState = typeof updater === "function" ? updater(currentState) : updater;
      return { ...current, accounts: { ...current.accounts, [accountId]: nextState } };
    }),
    createReservation: (reservation) => setWorkspace((current) => {
      if (current.reservations.some((candidate) => candidate.id === reservation.id)) return current;
      const accounts = adjustVendorAvailability({ ...current.accounts }, reservation.supplierMerchantId, reservation.items, -1);
      return { ...current, accounts, reservations: [...current.reservations, reservation] };
    }),
    updateReservationStatus: (reservationId, status) => setWorkspace((current) => {
      const reservation = current.reservations.find((candidate) => candidate.id === reservationId);
      if (!reservation || reservation.status === "FULFILLED" || reservation.status === "CANCELLED") return current;
      if (status !== "FULFILLED" && status !== "CANCELLED") return current;

      let accounts = { ...current.accounts };
      const buyer = accounts[reservation.buyerMerchantId];
      const supplier = accounts[reservation.supplierMerchantId];
      if (!buyer || !supplier) return current;

      const updatedBuyerMerchant = {
        ...buyer.merchant,
        reservedBusinessFunds: Math.max(0, buyer.merchant.reservedBusinessFunds - reservation.gcashAmount),
        reservedCashFunds: Math.max(0, buyer.merchant.reservedCashFunds - reservation.cashAmount),
        updatedAt: new Date().toISOString(),
      };
      let updatedBuyer: AppState = updatePlanStatus({ ...buyer, merchant: updatedBuyerMerchant }, reservation.id, status);

      if (status === "FULFILLED") {
        const quantities = reservation.items.reduce<Record<string, number>>((result, item) => {
          result[item.productName] = (result[item.productName] ?? 0) + item.quantity;
          return result;
        }, {});
        updatedBuyer = {
          ...updatedBuyer,
          products: updatedBuyer.products.map((product) => quantities[product.name] ? { ...product, stock: product.stock + quantities[product.name], updatedAt: new Date().toISOString() } : product),
        };
        accounts[reservation.supplierMerchantId] = {
          ...supplier,
          merchant: {
            ...supplier.merchant,
            businessFunds: supplier.merchant.businessFunds + reservation.gcashAmount,
            cashOnHand: supplier.merchant.cashOnHand + reservation.cashAmount,
            updatedAt: new Date().toISOString(),
          },
          products: supplier.products.map((product) => quantities[product.name] ? { ...product, stock: Math.max(0, product.stock - quantities[product.name]), updatedAt: new Date().toISOString() } : product),
        };
      } else {
        accounts = adjustVendorAvailability(accounts, reservation.supplierMerchantId, reservation.items, 1);
      }

      accounts[reservation.buyerMerchantId] = updatedBuyer;
      return {
        ...current,
        accounts,
        reservations: current.reservations.map((candidate) => candidate.id === reservationId ? { ...candidate, status } : candidate),
      };
    }),
    resetDemo: () => setWorkspace(createDefaultWorkspace()),
  }), [accountId, hydrated, state, workspace]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoStore must be used inside DemoProvider");
  return context;
}

export const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
