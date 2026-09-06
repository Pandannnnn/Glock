"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, ChevronRight, CreditCard, Gift, Grid2X2, HelpCircle, Landmark, PackageOpen, QrCode, Sparkles, Store, WalletCards } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge, LinkArrow } from "@/components/ui";
import { useDemoStore } from "@/lib/demo-store";

const services = [
  { label: "Send Money", caption: "To another GCash user", icon: ArrowLeft, color: "bg-blue-50 text-brand" },
  { label: "Pay Bills", caption: "Bills and utilities", icon: Landmark, color: "bg-violet-50 text-violet-600" },
  { label: "GLoans", caption: "Simulated credit", icon: CreditCard, color: "bg-amber-50 text-amber-600" },
  { label: "Rewards", caption: "Earn and redeem", icon: Gift, color: "bg-emerald-50 text-emerald-600" },
  { label: "Scan QR", caption: "Pay with QR", icon: QrCode, color: "bg-cyan-50 text-cyan-600" },
  { label: "Help Center", caption: "We’re here to help", icon: HelpCircle, color: "bg-slate-100 text-slate-600" },
];

export function ViewMoreClient() {
  const { state } = useDemoStore();
  const enabled = state.merchant.glockEnabled;
  return <><SiteHeader /><main className="app-container max-w-[1120px] py-7 sm:py-10"><div className="flex items-center gap-2 text-sm font-bold text-slate-400"><Link href="/" className="hover:text-brand">Home</Link><ChevronRight size={15} /><span>View More</span></div><div className="mt-8 max-w-2xl"><div className="eyebrow">Simulated GCash services</div><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">More ways to move forward.</h1><p className="mt-3 text-base leading-7 text-muted">Explore familiar services, then open GLock when you’re ready to give your business its own workspace.</p></div>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(({ label, caption, icon: Icon, color }) => <button key={label} className="soft-surface flex items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}><Icon size={20} /></span><span><span className="block text-sm font-black text-ink">{label}</span><span className="mt-1 block text-xs text-muted">{caption}</span></span><ChevronRight size={16} className="ml-auto text-slate-300" /></button>)}</section>
    <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d2c60] via-[#1552a0] to-[#1677ff] p-6 text-white shadow-card sm:p-8"><div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[34px] border-white/10" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div className="max-w-xl"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Store size={17} /></span><span className="text-sm font-black tracking-wide">GLock Merchant</span><Badge tone="blue">New</Badge></div><h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Your business deserves its own flow.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-blue-100">Separate funds, accept a simulated transaction QR, and turn sales signals into your next buying move — all in one merchant view.</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-blue-100"><span className="rounded-full bg-white/10 px-3 py-2">Business wallet</span><span className="rounded-full bg-white/10 px-3 py-2">Inventory planning</span><span className="rounded-full bg-white/10 px-3 py-2">GRadar trends</span></div></div><div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">{enabled ? <Link href="/glock/dashboard" className="primary-btn bg-white text-navy hover:bg-blue-50"><BarChart3 size={16} /> Open GLock <LinkArrow /></Link> : <Link href="/glock/onboarding" className="primary-btn bg-white text-navy hover:bg-blue-50"><Sparkles size={16} /> Enable GLock <LinkArrow /></Link>}<Link href="/glock/onboarding" className="ghost-btn justify-center text-blue-100 hover:bg-white/10 hover:text-white">{enabled ? "Reconfigure merchant" : "See how it works"}</Link></div></div></section>
    <div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="soft-surface p-5"><WalletCards size={20} className="text-brand" /><h3 className="mt-4 font-black">Separate money</h3><p className="mt-1 text-sm leading-6 text-muted">Keep Personal Funds distinct from the money that keeps shelves moving.</p></div><div className="soft-surface p-5"><PackageOpen size={20} className="text-emerald-600" /><h3 className="mt-4 font-black">Plan ahead</h3><p className="mt-1 text-sm leading-6 text-muted">Use Forecast AI or trusted merchant connections for restock ideas.</p></div><div className="soft-surface p-5"><Grid2X2 size={20} className="text-violet-600" /><h3 className="mt-4 font-black">See the signal</h3><p className="mt-1 text-sm leading-6 text-muted">GRadar only shows aggregated, anonymized demand patterns.</p></div></div>
    <p className="mt-8 text-center text-[11px] font-semibold text-slate-400">GLock is a simulated extension concept. No real payments, loans, or GCash integrations are active.</p>
  </main></>;
}
