"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, BarChart3, ChevronRight, QrCode, ShoppingBag, Sparkles, WalletCards } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge, LinkArrow, StatCard } from "@/components/ui";
import { useDemoStore } from "@/lib/demo-store";
import { availableBusinessFunds, lowStockProducts, peso, todaySales, weeklySales } from "@/lib/format";

const shortcuts = [
  { label: "Send", icon: ArrowUpRight, tone: "bg-blue-50 text-brand" },
  { label: "Receive", icon: ArrowDownLeft, tone: "bg-emerald-50 text-emerald-600" },
  { label: "Pay QR", icon: QrCode, tone: "bg-violet-50 text-violet-600" },
  { label: "Shop", icon: ShoppingBag, tone: "bg-amber-50 text-amber-600" },
];

export function HomeClient() {
  const { state } = useDemoStore();
  const totalBalance = state.merchant.personalFunds + state.merchant.businessFunds;
  const lowStock = lowStockProducts(state.products);
  return <>
    <SiteHeader />
    <main className="app-container py-7 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d2c60] via-[#1552a0] to-[#1677ff] p-6 text-white shadow-card sm:p-8">
          <div className="flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-blue-100">Good morning, {state.merchant.ownerName.split(" ")[0]} <span aria-hidden>👋</span></div><h1 className="mt-3 max-w-lg text-3xl font-black tracking-tight sm:text-5xl">Your money, your <span className="text-cyan-200">momentum.</span></h1><p className="mt-4 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">A calmer way to see personal cash, business funds, and what to restock next.</p></div><div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/10 sm:flex"><WalletCards size={22} /></div></div>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-5"><div><div className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">Total GCash balance</div><div className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">{peso(totalBalance)}</div><div className="mt-2 text-xs text-blue-100">Last updated just now · Demo wallet</div></div><Link href="/glock/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-navy transition hover:bg-blue-50">Open GLock <LinkArrow /></Link></div>
          <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-blue-100"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Simulated GCash home · Seeded merchant data</div>
        </section>
        <section className="surface flex flex-col justify-between p-5 sm:p-6"><div><div className="flex items-start justify-between"><div><div className="eyebrow">GLock merchant</div><h2 className="mt-1 text-2xl font-black tracking-tight">{state.merchant.businessName}</h2></div><Badge tone="green" dot>Active</Badge></div><p className="mt-3 text-sm leading-6 text-muted">Separate business money, make each sale count, and plan inventory before the shelf goes empty.</p></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-bold text-brand">Business Funds</div><div className="mt-2 text-xl font-black text-navy">{peso(state.merchant.businessFunds)}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-bold text-emerald-700">Available</div><div className="mt-2 text-xl font-black text-navy">{peso(availableBusinessFunds(state))}</div></div></div><Link href="/view-more" className="mt-5 flex items-center justify-between rounded-2xl border border-line px-4 py-3 text-sm font-bold transition hover:border-blue-200 hover:bg-blue-50"><span>Explore more services</span><ChevronRight size={17} className="text-brand" /></Link></section>
      </div>

      <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><div className="eyebrow">Everyday money moves</div><h2 className="mt-1 text-xl font-black tracking-tight">Shortcuts</h2></div><span className="text-xs font-bold text-slate-400">Simulated actions</span></div><div className="grid grid-cols-4 gap-2 sm:gap-4">{shortcuts.map(({ label, icon: Icon, tone }) => <button key={label} className="soft-surface flex flex-col items-center gap-3 p-3 transition hover:-translate-y-0.5 hover:border-blue-200 sm:p-4"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}><Icon size={19} /></span><span className="text-xs font-bold text-slate-600">{label}</span></button>)}</div></section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3"><StatCard icon={BarChart3} label="Today’s sales" value={peso(todaySales(state))} detail="Incoming business funds" trend="Live demo" /><StatCard icon={WalletCards} label="This week" value={peso(weeklySales(state))} detail="Across paid transactions" tone="green" /><StatCard icon={Sparkles} label="Low-stock watch" value={`${lowStock.length} items`} detail={lowStock.length ? `${lowStock[0].name} needs attention` : "All shelves look healthy"} tone="amber" /></section>

      <section className="mt-8 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm"><Sparkles size={19} /></div><div><div className="eyebrow text-brand">A better merchant day</div><h2 className="mt-1 text-xl font-black tracking-tight">Let GLock watch the details.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Simulate a QR sale, see stock move automatically, then turn a low-stock alert into a funded buying plan.</p></div></div><Link href="/glock/dashboard" className="primary-btn shrink-0">Go to dashboard <LinkArrow /></Link></div></section>

      <div className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-slate-400"><span>GLock by GCash · Hackathon prototype</span><span>·</span><span>No real payments or banking connections</span></div>
    </main>
  </>;
}
