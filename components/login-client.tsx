"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, LogIn, ShieldCheck, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui";
import { DEMO_ACCOUNTS, useAuth } from "@/lib/auth";

export function LoginClient() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = signIn(username, password);
    if (!result.ok) {
      setError(result.message ?? "Sign-in failed.");
      return;
    }
    router.push("/glock/dashboard");
  };

  return <>
    <SiteHeader />
    <main className="app-container py-10 sm:py-14">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="rounded-[2rem] bg-gradient-to-br from-[#0d2c60] via-[#1552a0] to-[#1677ff] p-6 text-white shadow-card sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Store size={22} /></div>
          <div className="mt-7 text-xs font-black uppercase tracking-[0.14em] text-blue-200">GLock demo access</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Sign in to a merchant account.</h1>
          <p className="mt-4 text-sm leading-6 text-blue-100">Use either seeded account to move between the buyer view and Kuya Mark Frozen Goods’ supplier view in the same simulated workspace.</p>
          <div className="mt-7 flex items-start gap-3 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-blue-100"><ShieldCheck size={16} className="mt-0.5 shrink-0" /><span>Prototype authentication only. Credentials are intentionally hardcoded and no real account or payment data is used.</span></div>
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3"><div><div className="eyebrow text-brand">Demo login</div><h2 className="mt-1 text-2xl font-black tracking-tight">Choose a workspace</h2></div><Badge tone="amber">Simulated</Badge></div>
          <form className="mt-7 space-y-4" onSubmit={submit}>
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Username</span><input className="field" autoComplete="username" value={username} onChange={(event) => { setUsername(event.target.value); setError(""); }} placeholder="e.g. maya" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Password</span><input className="field" type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Enter demo password" /></label>
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
            <button className="primary-btn w-full" type="submit"><LogIn size={16} /> Sign in</button>
          </form>

          <div className="mt-8 border-t border-line pt-6"><div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400"><KeyRound size={14} /> Seeded credentials</div><div className="space-y-3">{DEMO_ACCOUNTS.map((account) => <button key={account.accountId} type="button" className="w-full rounded-2xl border border-line p-4 text-left transition hover:border-blue-200 hover:bg-blue-50" onClick={() => { setUsername(account.username); setPassword(account.password); setError(""); }}><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-black">{account.businessName}</div><div className="mt-1 text-xs text-muted">{account.ownerName}</div></div><Badge tone={account.accountId === "vendor-kuya-mark" ? "green" : "blue"}>{account.username}</Badge></div><div className="mt-3 text-xs font-bold text-slate-500">Password: <span className="font-black text-slate-700">{account.password}</span></div></button>)}</div><p className="mt-4 text-[11px] leading-5 text-slate-400">Click an account to fill the form, then sign in. Use Switch account in the header to change perspectives.</p></div>
        </section>
      </div>
    </main>
  </>;
}
