"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DemoAccountId } from "@/lib/types";

const AUTH_STORAGE_KEY = "glock-demo-auth-v1";

export interface DemoUser {
  accountId: DemoAccountId;
  username: string;
}

export const DEMO_ACCOUNTS: Array<{
  accountId: DemoAccountId;
  username: string;
  password: string;
  businessName: string;
  ownerName: string;
}> = [
  {
    accountId: "merchant-main",
    username: "maya",
    password: "maya123",
    businessName: "Kape Kubo Mini Mart",
    ownerName: "Maya Santos",
  },
  {
    accountId: "vendor-kuya-mark",
    username: "kuya.mark",
    password: "kuya123",
    businessName: "Kuya Mark Frozen Goods",
    ownerName: "Mark Villanueva",
  },
];

interface AuthContextValue {
  user: DemoUser | null;
  hydrated: boolean;
  signIn: (username: string, password: string) => { ok: boolean; message?: string };
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DemoUser>;
        const account = DEMO_ACCOUNTS.find((candidate) => candidate.accountId === parsed.accountId);
        if (account && parsed.username === account.username) setUser({ accountId: account.accountId, username: account.username });
      }
    } catch {
      // A broken demo session should behave like a signed-out session.
    } finally {
      setHydrated(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    hydrated,
    signIn: (username, password) => {
      const normalizedUsername = username.trim().toLowerCase();
      const account = DEMO_ACCOUNTS.find((candidate) => candidate.username === normalizedUsername && candidate.password === password);
      if (!account) return { ok: false, message: "That demo username or password is not recognized." };
      const nextUser = { accountId: account.accountId, username: account.username };
      setUser(nextUser);
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      return { ok: true };
    },
    signOut: () => {
      setUser(null);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    },
  }), [hydrated, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export const demoAccount = (accountId: DemoAccountId) => DEMO_ACCOUNTS.find((account) => account.accountId === accountId) ?? DEMO_ACCOUNTS[0];
