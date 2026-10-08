"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, FileSpreadsheet, Info, Plus, Sparkles, Trash2, Upload, WalletCards } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui";
import { parseProductsCsv } from "@/lib/csv";
import { makeId, useDemoStore } from "@/lib/demo-store";
import type { PlanningMethod, Product } from "@/lib/types";

type DraftProduct = Omit<Product, "id" | "merchantId" | "createdAt" | "updatedAt" | "isVisibleToConnectedBusinesses" | "vendorAvailableQuantity" | "vendorPrice">;

const blankProduct = (): DraftProduct => ({ name: "", category: "Food", subcategory: "General", stock: 10, sellingPrice: 50, costPrice: 30, planningMethod: "FORECAST_AI", lowStockThreshold: 5 });

const starterProducts: DraftProduct[] = [
  { name: "Chicken Fillet", category: "Food", subcategory: "Chicken", stock: 20, sellingPrice: 75, costPrice: 50, planningMethod: "FORECAST_AI", lowStockThreshold: 5 },
  { name: "Bottled Water", category: "Drinks", subcategory: "Water", stock: 30, sellingPrice: 20, costPrice: 12, planningMethod: "VMI", lowStockThreshold: 10 },
];

export function OnboardingClient() {
  const router = useRouter();
  const { state, hydrated, updateState } = useDemoStore();
  const [businessName, setBusinessName] = useState(state.merchant.businessName);
  const [ownerName, setOwnerName] = useState(state.merchant.ownerName);
  const [personalFunds, setPersonalFunds] = useState(String(state.merchant.personalFunds));
  const [businessFunds, setBusinessFunds] = useState(String(state.merchant.businessFunds));
  const [products, setProducts] = useState<DraftProduct[]>(starterProducts);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!hydrated) return;
    setBusinessName(state.merchant.businessName);
    setOwnerName(state.merchant.ownerName);
    setPersonalFunds(String(state.merchant.personalFunds));
    setBusinessFunds(String(state.merchant.businessFunds));
  }, [hydrated, state.merchant.businessName, state.merchant.ownerName, state.merchant.personalFunds, state.merchant.businessFunds]);

  const validProducts = useMemo(() => products.filter((product) => product.name.trim()), [products]);

  const updateProduct = (index: number, key: keyof DraftProduct, value: string | number | PlanningMethod) => {
    setProducts((current) => current.map((product, productIndex) => productIndex === index ? { ...product, [key]: value } : product));
  };

  const handleCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseProductsCsv(String(reader.result ?? ""));
      if (parsed.length) setProducts((current) => [...current.filter((product) => product.name.trim()), ...parsed]);
      else setError("We couldn’t find product rows in that CSV. Check the headers and try again.");
    };
    reader.readAsText(file);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!businessName.trim() || !ownerName.trim()) { setError("Add a business name and owner name to continue."); setStep(1); return; }
    if (!validProducts.length) { setError("Add at least one product or upload a CSV before continuing."); setStep(2); return; }
    const now = new Date().toISOString();
    const merchantId = state.merchant.id;
    const mapped: Product[] = validProducts.map((product) => ({ ...product, id: makeId("product"), merchantId, isVisibleToConnectedBusinesses: product.planningMethod === "VMI", vendorAvailableQuantity: 0, createdAt: now, updatedAt: now }));
    updateState((current) => ({
      ...current,
      merchant: { ...current.merchant, id: merchantId, businessName: businessName.trim(), ownerName: ownerName.trim(), personalFunds: Number(personalFunds) || 0, personalCashOnHand: 0, businessFunds: Number(businessFunds) || 0, reservedBusinessFunds: 0, cashOnHand: 0, reservedCashFunds: 0, glockEnabled: true, updatedAt: now },
      products: mapped,
      transactions: [],
      reservedPlans: [],
      plannerUnlocked: false,
      lastReceiptId: undefined,
    }));
    router.push("/glock/dashboard");
  };

  return <><SiteHeader /><main className="app-container max-w-[1180px] py-7 sm:py-10"><div className="flex items-center gap-2 text-sm font-bold text-slate-400"><Link href="/view-more" className="hover:text-brand">View More</Link><span>/</span><span>Enable GLock</span></div><div className="mt-8 grid gap-8 lg:grid-cols-[0.34fr_0.66fr]"><aside className="lg:sticky lg:top-6 lg:self-start"><div className="eyebrow">GLock setup</div><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Set up your merchant workspace.</h1><p className="mt-3 text-sm leading-6 text-muted">A few details help GLock make the dashboard feel like it belongs to your business.</p><div className="mt-7 space-y-3">{[{ number: "01", title: "Business profile", copy: "Name your store and set starting funds" }, { number: "02", title: "Product shelf", copy: "Add items and choose the planning method" }].map((item, index) => <div key={item.number} className={`flex gap-3 rounded-2xl border p-4 transition ${step === index + 1 ? "border-blue-200 bg-blue-50" : "border-line bg-white"}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${step === index + 1 ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}>{step > index + 1 ? <Check size={15} /> : item.number}</span><div><div className="text-sm font-black">{item.title}</div><div className="mt-1 text-xs leading-5 text-muted">{item.copy}</div></div></div>)}</div><div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800"><div className="flex items-center gap-2 font-black"><Info size={15} /> Prototype-safe setup</div><p className="mt-2">Funds are simulated and saved locally in this browser. No login, payment, or GCash connection is created.</p></div></aside>
      <form onSubmit={submit} className="space-y-6">
        {step === 1 ? <section className="surface p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><div className="eyebrow">Step 1 of 2</div><h2 className="mt-1 text-2xl font-black tracking-tight">Tell us about the business</h2><p className="mt-1 text-sm text-muted">This is the merchant context used throughout the demo.</p></div><WalletCards className="text-brand" /></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-2 block text-xs font-black text-slate-600">Business name</span><input className="field" value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="e.g. Aling Nena’s Sari-Sari Store" /></label><label><span className="mb-2 block text-xs font-black text-slate-600">Owner name</span><input className="field" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="e.g. Maya Santos" /></label><div className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-muted"><div className="flex items-center gap-2 font-black text-slate-700"><Sparkles size={15} className="text-brand" /> Friendly context</div><p className="mt-1">We use your owner name only for the greeting in this prototype.</p></div><label><span className="mb-2 block text-xs font-black text-slate-600">Starting Personal Funds</span><div className="relative"><span className="absolute left-3 top-3 text-sm font-bold text-slate-400">₱</span><input className="field pl-8" type="number" min="0" value={personalFunds} onChange={(event) => setPersonalFunds(event.target.value)} /></div></label><label><span className="mb-2 block text-xs font-black text-slate-600">Starting Business Funds</span><div className="relative"><span className="absolute left-3 top-3 text-sm font-bold text-slate-400">₱</span><input className="field pl-8" type="number" min="0" value={businessFunds} onChange={(event) => setBusinessFunds(event.target.value)} /></div></label></div><div className="mt-8 flex justify-end"><button type="button" className="primary-btn" onClick={() => { if (!businessName.trim() || !ownerName.trim()) setError("Add a business name and owner name to continue."); else { setError(""); setStep(2); } }}>Continue to products <ArrowRight size={16} /></button></div></section> : <section className="surface p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="eyebrow">Step 2 of 2</div><h2 className="mt-1 text-2xl font-black tracking-tight">Build your product shelf</h2><p className="mt-1 text-sm text-muted">Choose Forecast AI for a data-led estimate or VMI for a connected supplier.</p></div><label className="secondary-btn cursor-pointer"><Upload size={16} /> Upload CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsv} /></label></div><div className="mt-5 flex flex-wrap items-center gap-2"><Badge tone="blue"><FileSpreadsheet size={13} /> CSV format ready</Badge><span className="text-xs text-slate-400">name, category, subcategory, stock, sellingPrice, costPrice, planningMethod, lowStockThreshold</span></div><div className="mt-6 space-y-4">{products.map((product, index) => <div key={index} className="rounded-2xl border border-line bg-slate-50/60 p-4"><div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-black text-brand shadow-sm">{String(index + 1).padStart(2, "0")}</span><span className="text-sm font-black">Product details</span></div><button type="button" className="ghost-btn px-2 text-rose-500 hover:bg-rose-50" onClick={() => setProducts((current) => current.filter((_, productIndex) => productIndex !== index))}><Trash2 size={15} /></button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="lg:col-span-2"><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Product name</span><input className="field" value={product.name} onChange={(event) => updateProduct(index, "name", event.target.value)} placeholder="e.g. Chicken Fillet" /></label><label><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Category</span><input className="field" value={product.category} onChange={(event) => updateProduct(index, "category", event.target.value)} /></label><label><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Subcategory</span><input className="field" value={product.subcategory} onChange={(event) => updateProduct(index, "subcategory", event.target.value)} /></label><label><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Stock</span><input className="field" type="number" min="0" value={product.stock} onChange={(event) => updateProduct(index, "stock", Number(event.target.value))} /></label><label><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Selling price</span><div className="relative"><span className="absolute left-3 top-3 text-sm font-bold text-slate-400">₱</span><input className="field pl-8" type="number" min="0" value={product.sellingPrice} onChange={(event) => updateProduct(index, "sellingPrice", Number(event.target.value))} /></div></label><label><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Cost price</span><div className="relative"><span className="absolute left-3 top-3 text-sm font-bold text-slate-400">₱</span><input className="field pl-8" type="number" min="0" value={product.costPrice} onChange={(event) => updateProduct(index, "costPrice", Number(event.target.value))} /></div></label><label><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Low-stock threshold</span><input className="field" type="number" min="0" value={product.lowStockThreshold} onChange={(event) => updateProduct(index, "lowStockThreshold", Number(event.target.value))} /></label><label className="sm:col-span-2 lg:col-span-4"><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Planning method</span><div className="grid gap-2 sm:grid-cols-2"><button type="button" className={`rounded-xl border p-3 text-left transition ${product.planningMethod === "FORECAST_AI" ? "border-blue-300 bg-blue-50" : "border-line bg-white"}`} onClick={() => updateProduct(index, "planningMethod", "FORECAST_AI")}><span className="block text-sm font-black text-ink">Forecast AI</span><span className="mt-1 block text-xs text-muted">Rule-based demo suggestions for buying quantity and budget.</span></button><button type="button" className={`rounded-xl border p-3 text-left transition ${product.planningMethod === "VMI" ? "border-emerald-300 bg-emerald-50" : "border-line bg-white"}`} onClick={() => updateProduct(index, "planningMethod", "VMI")}><span className="block text-sm font-black text-ink">VMI</span><span className="mt-1 block text-xs text-muted">Source from approved connected merchant inventory.</span></button></div></label></div></div>)}</div><button type="button" className="secondary-btn mt-4" onClick={() => setProducts((current) => [...current, blankProduct()])}><Plus size={16} /> Add another product</button><div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><button type="button" className="ghost-btn justify-start" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back to business profile</button><button type="submit" className="primary-btn">Create GLock workspace <Sparkles size={16} /></button></div></section>}
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
      </form></div><p className="mt-8 text-center text-[11px] font-semibold text-slate-400">Demo AI uses deterministic fallback recommendations when no Gemini API key is configured.</p></main></>;
}
