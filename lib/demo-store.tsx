"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createDefaultState } from "@/lib/demo-data";
import type { AppState } from "@/lib/types";

const STORAGE_KEY = "glock-demo-state-v1";

interface DemoContextValue {
  state: AppState;
  hydrated: boolean;
  updateState: (updater: AppState | ((current: AppState) => AppState)) => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createDefaultState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved) as AppState);
    } catch {
      // A broken local demo snapshot should never stop the prototype from opening.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const value = useMemo<DemoContextValue>(() => ({
    state,
    hydrated,
    updateState: (updater) => setState((current) => typeof updater === "function" ? updater(current) : updater),
    resetDemo: () => setState(createDefaultState()),
  }), [hydrated, state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoStore must be used inside DemoProvider");
  return context;
}

export const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
