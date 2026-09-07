"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Edit3,
  Filter,
  Handshake,
  Info,
  LineChart,
  Minus,
  Package,
  PackageCheck,
  Plus,
  QrCode,
  Receipt,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteHeader } from "@/components/site-header";
import { Badge, EmptyState, SectionTitle, StatCard, Toast, type Tone } from "@/components/ui";
import { parseProductsCsv } from "@/lib/csv";
import { generateAdaptiveSplit, generateForecastCards, generatePlannerExplanation, generateRadarSummary, generateVmiCards, plannerDataLabel } from "@/lib/ai";
import { makeId, useDemoStore } from "@/lib/demo-store";
import { availableBusinessFunds, categoryOptions, dateTime, distinctSalesDays, lowStockProducts, numberFormat, peso, shortDate, subcategoryOptions, timeOnly, todaySales, weeklySales } from "@/lib/format";
import type { AppState, PlannerCard, Product, Transaction, Vendor } from "@/lib/types";

type Tab = "Overview" | "Products" | "Planner" | "Connected Businesses" | "GRadar";
type Notice = { message: string; tone: "success" | "error" | "info" };

const tabs: Array<{ name: Tab; icon: typeof BarChart3 }> = [
  { name: "Overview", icon: BarChart3 },
  { name: "Products", icon: Package },
  { name: "Planner", icon: Sparkles },
  { name: "Connected Businesses", icon: Handshake },
  { name: "GRadar", icon: LineChart },
];

const toneForStatus = (status: Vendor["status"]): Tone => status === "APPROVED" ? "green" : status === "PENDING" ? "amber" : "red";
const relationshipLabel = (value: Vendor["relationshipType"]) => value === "BOTH" ? "Supplier + buyer" : value === "SUPPLIER" ? "Supplier" : "Buyer";

function useOptionalAiText(prompt: string, fallback: string) {
  const [text, setText] = useState(fallback);
  useEffect(() => {
    let active = true;
    setText(fallback);
    fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, fallback }) })
      .then((response) => response.json() as Promise<{ text?: string }>)
      .then((data) => { if (active && data.text) setText(data.text); })
      .catch(() => { /* Deterministic fallback remains visible when offline. */ });
    return () => { active = false; };
  }, [fallback, prompt]);
  return text;
}

type ForecastRequest = {
  products: Array<{
    id: string;
    name: string;
    category: string;
    subcategory: string;
    stock: number;
    costPrice: number;
    sellingPrice: number;
    lowStockThreshold: number;
    recentUnitsSold: number;
  }>;
  availableBusinessFunds: number;
  salesSummary: { today: number; last7Days: number; daysOfHistory: number };
};

type ForecastApiResponse = { mode?: "gemini" | "fallback"; cards?: PlannerCard[] };

function useGeminiForecastCards(request: ForecastRequest, fallbackCards: PlannerCard[]) {
  const [result, setResult] = useState<{ cards: PlannerCard[]; mode: "gemini" | "fallback"; loading: boolean }>({ cards: fallbackCards, mode: "fallback", loading: true });

  useEffect(() => {
    let active = true;
    setResult({ cards: fallbackCards, mode: "fallback", loading: true });
    fetch("/api/ai/forecast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) })
      .then((response) => {
        if (!response.ok) throw new Error("Forecast request failed");
        return response.json() as Promise<ForecastApiResponse>;
      })
      .then((data) => {
        if (!active) return;
        const useGeminiCards = data.mode === "gemini" && Array.isArray(data.cards) && data.cards.length > 0;
        setResult({ cards: useGeminiCards ? data.cards ?? fallbackCards : fallbackCards, mode: useGeminiCards ? "gemini" : "fallback", loading: false });
      })
      .catch(() => {
        if (active) setResult({ cards: fallbackCards, mode: "fallback", loading: false });
      });
    return () => { active = false; };
  }, [fallbackCards, request]);

  return result;
}

export function DashboardClient() {
  const { state, hydrated, updateState } = useDemoStore();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [notice, setNotice] = useState<Notice | null>(null);

  const showNotice = (message: string, tone: Notice["tone"] = "success") => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 3600);
  };

  if (!hydrated) return <><SiteHeader /><main className="app-container py-10"><div className="h-48 animate-pulse rounded-3xl bg-slate-200" /></main></>;

  return <>
    <SiteHeader />
    <main className="app-container py-7 sm:py-9">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="flex items-center gap-2 text-sm font-bold text-slate-400"><Link href="/" className="hover:text-brand">Home</Link><ChevronRight size={15} /><span>GLock Merchant</span></div><div className="mt-4 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{state.merchant.businessName}</h1><Badge tone="green" dot>Workspace active</Badge></div><p className="mt-2 text-sm text-muted">Good morning, {state.merchant.ownerName.split(" ")[0]}. Here’s the pulse of your business today.</p></div><div className="flex flex-wrap items-center gap-2"><Badge tone="amber">Seeded merchant data</Badge><button className="secondary-btn py-2.5" onClick={() => setActiveTab("Overview")}><QrCode size={16} /> Simulate sale</button></div></div>
      <div className="mt-7 overflow-x-auto rounded-2xl border border-line bg-white p-1 shadow-soft"><div className="flex min-w-max gap-1">{tabs.map(({ name, icon: Icon }) => <button key={name} onClick={() => setActiveTab(name)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:px-4 ${activeTab === name ? "bg-navy text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-ink"}`}><Icon size={16} />{name === "Connected Businesses" ? <span className="hidden sm:inline">{name}</span> : name}</button>)}</div></div>
      <div className="mt-7">{activeTab === "Overview" && <OverviewTab state={state} updateState={updateState} showNotice={showNotice} />}{activeTab === "Products" && <ProductsTab state={state} updateState={updateState} showNotice={showNotice} />}{activeTab === "Planner" && <PlannerTab state={state} updateState={updateState} showNotice={showNotice} />}{activeTab === "Connected Businesses" && <ConnectedBusinessesTab state={state} updateState={updateState} showNotice={showNotice} />}{activeTab === "GRadar" && <GRadarTab state={state} />}</div>
    </main>
    {notice && <Toast message={notice.message} tone={notice.tone} onClose={() => setNotice(null)} />}
  </>;
}

function OverviewTab({ state, updateState, showNotice }: { state: AppState; updateState: (updater: AppState | ((current: AppState) => AppState)) => void; showNotice: (message: string, tone?: Notice["tone"]) => void }) {
  const lowStock = lowStockProducts(state.products);
  const paid = state.transactions.filter((transaction) => transaction.paymentStatus === "PAID").sort((a, b) => new Date(b.paidAt ?? b.createdAt).getTime() - new Date(a.paidAt ?? a.createdAt).getTime());
  return <div className="space-y-7">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={WalletCards} label="Personal Funds" value={peso(state.merchant.personalFunds)} detail="Your personal wallet" /><StatCard icon={Store} label="Business Funds" value={peso(state.merchant.businessFunds)} detail="All incoming business sales" tone="green" /><StatCard icon={CircleDollarSign} label="Reserved Funds" value={peso(state.merchant.reservedBusinessFunds)} detail="Confirmed buying plans" tone="purple" /><StatCard icon={TrendingUp} label="Available Funds" value={peso(availableBusinessFunds(state))} detail="Safe to plan today" tone="amber" /></div>
    <div className="grid gap-4 sm:grid-cols-3"><StatCard icon={ArrowDownLeft} label="Today’s sales" value={peso(todaySales(state))} detail="Paid QR transactions" trend="+12.4%" /><StatCard icon={BarChart3} label="Weekly sales" value={peso(weeklySales(state))} detail="Last 7 days" tone="green" /><StatCard icon={Receipt} label="Transactions" value={String(paid.length)} detail="Paid demo receipts" tone="purple" /></div>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><TransactionSimulator state={state} updateState={updateState} showNotice={showNotice} /><div className="space-y-6"><section className="surface p-5 sm:p-6"><SectionTitle eyebrow="Watch list" title="Low-stock alerts" description="Keep your fast movers within reach." action={<Badge tone={lowStock.length ? "amber" : "green"}>{lowStock.length} items</Badge>} />{lowStock.length ? <div className="space-y-3">{lowStock.slice(0, 4).map((product) => <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600"><AlertTriangle size={16} /></span><div className="min-w-0"><div className="truncate text-sm font-black">{product.name}</div><div className="mt-0.5 text-xs text-muted">{product.category} · threshold {product.lowStockThreshold}</div></div></div><span className="shrink-0 text-sm font-black text-amber-700">{product.stock} left</span></div>)}</div> : <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">All stocked up for now. Nice work.</div>}<button className="ghost-btn mt-4 px-0 text-brand" onClick={() => showNotice("Product tools are in the Products tab.", "info")}>Manage inventory <ChevronRight size={15} /></button></section><RecentTransactions transactions={paid.slice(0, 4)} /></div></div>
  </div>;
}

function TransactionSimulator({ state, updateState, showNotice }: { state: AppState; updateState: (updater: AppState | ((current: AppState) => AppState)) => void; showNotice: (message: string, tone?: Notice["tone"]) => void }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [qrShown, setQrShown] = useState(false);
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const selectedItems = useMemo(() => state.products.map((product) => ({ product, quantity: quantities[product.id] ?? 0 })).filter(({ quantity }) => quantity > 0), [quantities, state.products]);
  const total = selectedItems.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);

  const setQuantity = (product: Product, next: number) => setQuantities((current) => ({ ...current, [product.id]: Math.max(0, Math.min(product.stock, next)) }));
  const simulatePayment = () => {
    if (!selectedItems.length) { showNotice("Add at least one product to create a QR order.", "error"); return; }
    const now = new Date().toISOString();
    const newTransaction: Transaction = { id: makeId("transaction"), merchantId: state.merchant.id, totalAmount: total, paymentStatus: "PAID", receiptCode: `GLK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 899)}`, paidAt: now, createdAt: now, items: selectedItems.map(({ product, quantity }) => ({ id: makeId("item"), productId: product.id, productName: product.name, quantity, unitPrice: product.sellingPrice, subtotal: product.sellingPrice * quantity })) };
    updateState((current) => ({ ...current, merchant: { ...current.merchant, businessFunds: current.merchant.businessFunds + total, updatedAt: now }, products: current.products.map((product) => { const item = selectedItems.find(({ product: selected }) => selected.id === product.id); return item ? { ...product, stock: product.stock - item.quantity, updatedAt: now } : product; }), transactions: [newTransaction, ...current.transactions], lastReceiptId: newTransaction.id }));
    setReceipt(newTransaction); setQuantities({}); setQrShown(false); showNotice("Simulated payment received. Stock and Business Funds are updated.");
  };

  return <section className="surface overflow-hidden"><div className="border-b border-line bg-gradient-to-r from-blue-50 to-cyan-50 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="eyebrow text-brand">Digital cashier</div><h2 className="mt-1 text-2xl font-black tracking-tight">Simulate a transaction</h2><p className="mt-1 text-sm text-muted">Create a transaction-specific QR and watch the receipt come together.</p></div><Badge tone="blue"><QrCode size={13} /> Mock QR</Badge></div></div><div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.72fr]">{receipt ? <ReceiptCard transaction={receipt} businessName={state.merchant.businessName} onClose={() => setReceipt(null)} /> : <div><div className="mb-3 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Choose items</span><span className="text-xs font-bold text-slate-400">{selectedItems.length} selected</span></div><div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">{state.products.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3"><div className="min-w-0"><div className="truncate text-sm font-black">{product.name}</div><div className="mt-1 text-xs text-muted">{peso(product.sellingPrice)} · {product.stock} in stock</div></div><div className="flex items-center gap-1.5"><button className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40" disabled={!quantities[product.id]} onClick={() => setQuantity(product, (quantities[product.id] ?? 0) - 1)}><Minus size={14} /></button><span className="w-6 text-center text-sm font-black">{quantities[product.id] ?? 0}</span><button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand disabled:opacity-40" disabled={(quantities[product.id] ?? 0) >= product.stock} onClick={() => setQuantity(product, (quantities[product.id] ?? 0) + 1)}><Plus size={14} /></button></div></div>)}</div></div>}<div className="rounded-2xl border border-line bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-sm font-bold text-muted">Order total</span><span className="text-2xl font-black text-navy">{peso(total)}</span></div>{selectedItems.length ? <div className="mt-4 space-y-2 border-t border-line pt-4">{selectedItems.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-3 text-xs"><span className="truncate text-muted">{quantity} × {product.name}</span><span className="font-bold">{peso(product.sellingPrice * quantity)}</span></div>)}</div> : <div className="mt-6 rounded-xl bg-white p-4 text-center text-xs font-bold text-slate-400">Select products to preview the order.</div>}{qrShown && selectedItems.length ? <div className="mt-5 rounded-2xl bg-white p-4 text-center"><div className="mx-auto flex w-fit rounded-xl border border-line p-2"><QRCodeSVG value={`glock://mock-payment/${state.merchant.id}/${total}/${Date.now()}`} size={132} bgColor="#ffffff" fgColor="#102a56" /></div><div className="mt-3 text-xs font-black text-navy">Scan to pay · Simulated</div><div className="mt-1 text-[11px] text-muted">Transaction QR · no money moves</div><button className="primary-btn mt-4 w-full" onClick={simulatePayment}><CheckCircle2 size={16} /> Simulate Payment</button></div> : <button className="primary-btn mt-5 w-full" disabled={!selectedItems.length} onClick={() => setQrShown(true)}><QrCode size={16} /> Generate mock QR</button>}<div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-400"><Info size={14} className="mt-0.5 shrink-0" /> Payment is simulated. A successful payment increases Business Funds and deducts stock instantly.</div></div></div></section>;
}

function ReceiptCard({ transaction, businessName, onClose }: { transaction: Transaction; businessName: string; onClose?: () => void }) {
  return <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4"><div className="flex items-start justify-between gap-3"><div><Badge tone="green" dot>Payment successful</Badge><h3 className="mt-3 text-lg font-black">Compact receipt</h3></div>{onClose && <button className="ghost-btn px-2" onClick={onClose}><X size={16} /></button>}</div><div className="mt-4 rounded-2xl bg-white p-4"><div className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-3"><div><div className="text-xs text-muted">Receipt code</div><div className="mt-1 text-sm font-black">{transaction.receiptCode}</div></div><Receipt size={20} className="text-emerald-600" /></div><div className="space-y-2 py-3 text-xs"><div className="flex justify-between gap-3"><span className="text-muted">Merchant</span><span className="font-bold text-right">{businessName}</span></div><div className="flex justify-between gap-3"><span className="text-muted">Date & time</span><span className="font-bold">{dateTime(transaction.paidAt ?? transaction.createdAt)}</span></div>{transaction.items.map((item) => <div key={item.id} className="flex justify-between gap-3"><span className="truncate text-muted">{item.quantity} × {item.productName}</span><span className="font-bold">{peso(item.subtotal)}</span></div>)}</div><div className="flex justify-between border-t border-dashed border-line pt-3"><span className="text-sm font-bold">Paid amount</span><span className="text-lg font-black text-navy">{peso(transaction.totalAmount)}</span></div></div><div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700"><Check size={14} /> Payment status: PAID · Business Funds updated</div></div>;
}

function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return <section className="surface p-5 sm:p-6"><SectionTitle eyebrow="Cashier history" title="Recent transactions" action={<Badge tone="blue">{transactions.length} latest</Badge>} />{transactions.length ? <div className="space-y-3">{transactions.map((transaction) => <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ArrowDownLeft size={16} /></span><div className="min-w-0"><div className="truncate text-sm font-black">{transaction.items.map((item) => item.productName).join(", ")}</div><div className="mt-1 text-xs text-muted">{transaction.receiptCode} · {timeOnly(transaction.paidAt ?? transaction.createdAt)}</div></div></div><div className="shrink-0 text-right"><div className="text-sm font-black text-navy">{peso(transaction.totalAmount)}</div><div className="mt-1 text-[10px] font-bold text-emerald-600">Paid</div></div></div>)}</div> : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-muted">No paid transactions yet.</div>}</section>;
}

interface ProductFormValues { name: string; category: string; subcategory: string; stock: number; sellingPrice: number; costPrice: number; planningMethod: Product["planningMethod"]; lowStockThreshold: number; isVisibleToConnectedBusinesses: boolean; vendorAvailableQuantity: number; vendorPrice?: number; }

const blankProductForm: ProductFormValues = { name: "", category: "Food", subcategory: "General", stock: 0, sellingPrice: 0, costPrice: 0, planningMethod: "FORECAST_AI", lowStockThreshold: 5, isVisibleToConnectedBusinesses: false, vendorAvailableQuantity: 0, vendorPrice: undefined };

function ProductsTab({ state, updateState, showNotice }: { state: AppState; updateState: (updater: AppState | ((current: AppState) => AppState)) => void; showNotice: (message: string, tone?: Notice["tone"]) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductFormValues>(blankProductForm);
  const categories = categoryOptions(state.products);
  const subcategories = subcategoryOptions(state.products, category);
  const filtered = state.products.filter((product) => (!search || `${product.name} ${product.category} ${product.subcategory}`.toLowerCase().includes(search.toLowerCase())) && (!category || product.category === category) && (!subcategory || product.subcategory === subcategory));

  const openNew = () => { setEditingId(null); setForm(blankProductForm); setShowForm(true); };
  const openEdit = (product: Product) => { setEditingId(product.id); setForm({ name: product.name, category: product.category, subcategory: product.subcategory, stock: product.stock, sellingPrice: product.sellingPrice, costPrice: product.costPrice, planningMethod: product.planningMethod, lowStockThreshold: product.lowStockThreshold, isVisibleToConnectedBusinesses: product.isVisibleToConnectedBusinesses, vendorAvailableQuantity: product.vendorAvailableQuantity, vendorPrice: product.vendorPrice }); setShowForm(true); };
  const save = () => {
    if (!form.name.trim()) { showNotice("Product name is required.", "error"); return; }
    const now = new Date().toISOString();
    updateState((current) => ({ ...current, products: editingId ? current.products.map((product) => product.id === editingId ? { ...product, ...form, updatedAt: now } : product) : [...current.products, { ...form, id: makeId("product"), merchantId: current.merchant.id, createdAt: now, updatedAt: now }] }));
    setShowForm(false); showNotice(editingId ? "Product updated." : "Product added to inventory.");
  };
  const deleteProduct = (id: string) => { if (!window.confirm("Delete this product from the demo inventory?")) return; updateState((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) })); showNotice("Product removed.", "info"); };
  const updateProduct = (id: string, patch: Partial<Product>) => updateState((current) => ({ ...current, products: current.products.map((product) => product.id === id ? { ...product, ...patch, updatedAt: new Date().toISOString() } : product) }));
  const uploadCsv = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const rows = parseProductsCsv(String(reader.result ?? "")); if (!rows.length) { showNotice("No valid product rows found in that CSV.", "error"); return; } const now = new Date().toISOString(); updateState((current) => ({ ...current, products: [...current.products, ...rows.map((row) => ({ ...row, id: makeId("product"), merchantId: current.merchant.id, isVisibleToConnectedBusinesses: row.planningMethod === "VMI", vendorAvailableQuantity: 0, createdAt: now, updatedAt: now }))] })); showNotice(`${rows.length} products imported from CSV.`); }; reader.readAsText(file); };

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><SectionTitle eyebrow="Inventory control" title="Products" description="Keep shelf counts, margins, and planning methods in one place." /></div><div className="flex flex-wrap gap-2"><label className="secondary-btn cursor-pointer"><Upload size={16} /> Upload CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={uploadCsv} /></label><button className="primary-btn" onClick={openNew}><Plus size={16} /> Add product</button></div></div>{showForm && <ProductEditor form={form} setForm={setForm} editing={Boolean(editingId)} onSave={save} onCancel={() => setShowForm(false)} />}
    <section className="surface overflow-hidden"><div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input className="field pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /></div><div className="flex flex-wrap gap-2"><div className="relative"><select className="select-field min-w-[135px] pr-8 text-xs" value={category} onChange={(event) => { setCategory(event.target.value); setSubcategory(""); }}><option value="">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-400" /></div><div className="relative"><select className="select-field min-w-[145px] pr-8 text-xs" value={subcategory} onChange={(event) => setSubcategory(event.target.value)}><option value="">All subcategories</option>{subcategories.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-400" /></div><Badge tone="slate"><Filter size={12} /> {filtered.length} shown</Badge></div></div>{filtered.length ? <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400"><tr><th className="px-5 py-4">Product</th><th className="px-3 py-4">Stock</th><th className="px-3 py-4">Prices</th><th className="px-3 py-4">Method</th><th className="px-3 py-4">Connected visibility</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-line">{filtered.map((product) => <tr key={product.id} className="align-middle"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand"><Package size={16} /></span><div><div className="text-sm font-black">{product.name}</div><div className="mt-1 text-xs text-muted">{product.category} · {product.subcategory}</div></div></div></td><td className="px-3 py-4"><div className={`text-sm font-black ${product.stock <= product.lowStockThreshold ? "text-amber-700" : "text-ink"}`}>{product.stock} units</div>{product.stock <= product.lowStockThreshold && <div className="mt-1 text-[10px] font-bold text-amber-600">Low stock</div>}</td><td className="px-3 py-4"><div className="text-sm font-black">{peso(product.sellingPrice)}</div><div className="mt-1 text-xs text-muted">Cost {peso(product.costPrice)}</div></td><td className="px-3 py-4"><Badge tone={product.planningMethod === "VMI" ? "green" : "purple"}>{product.planningMethod === "VMI" ? "VMI" : "Forecast AI"}</Badge></td><td className="px-3 py-4"><label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={product.isVisibleToConnectedBusinesses} onChange={(event) => updateProduct(product.id, { isVisibleToConnectedBusinesses: event.target.checked })} className="h-4 w-4 accent-brand" /> Visible to partners</label>{product.isVisibleToConnectedBusinesses && <div className="mt-2 flex gap-2"><input className="field w-24 px-2 py-1.5 text-xs" type="number" min="0" value={product.vendorAvailableQuantity} onChange={(event) => updateProduct(product.id, { vendorAvailableQuantity: Number(event.target.value) })} title="Vendor available quantity" /><input className="field w-24 px-2 py-1.5 text-xs" type="number" min="0" value={product.vendorPrice ?? ""} onChange={(event) => updateProduct(product.id, { vendorPrice: Number(event.target.value) })} placeholder="₱ price" title="Vendor price" /></div>}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button className="ghost-btn px-2 text-brand" onClick={() => openEdit(product)} title="Edit product"><Edit3 size={15} /></button><button className="ghost-btn px-2 text-rose-500" onClick={() => deleteProduct(product.id)} title="Delete product"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div><div className="space-y-3 p-4 md:hidden">{filtered.map((product) => <div key={product.id} className="rounded-2xl border border-line p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand"><Package size={16} /></span><div className="min-w-0"><div className="truncate text-sm font-black">{product.name}</div><div className="mt-1 text-xs text-muted">{product.category} · {product.subcategory}</div></div></div><div className="flex gap-1"><button className="ghost-btn px-2 text-brand" onClick={() => openEdit(product)}><Edit3 size={15} /></button><button className="ghost-btn px-2 text-rose-500" onClick={() => deleteProduct(product.id)}><Trash2 size={15} /></button></div></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-2"><div className="text-slate-400">Stock</div><div className="mt-1 font-black">{product.stock}</div></div><div className="rounded-xl bg-slate-50 p-2"><div className="text-slate-400">Sell</div><div className="mt-1 font-black">{peso(product.sellingPrice)}</div></div><div className="rounded-xl bg-slate-50 p-2"><div className="text-slate-400">Plan</div><div className="mt-1 font-black">{product.planningMethod === "VMI" ? "VMI" : "AI"}</div></div></div><label className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={product.isVisibleToConnectedBusinesses} onChange={(event) => updateProduct(product.id, { isVisibleToConnectedBusinesses: event.target.checked })} className="h-4 w-4 accent-brand" /> Visible to connected businesses</label></div>)}</div></> : <div className="p-8"><EmptyState icon={Search} title="No products found" description="Try a different search or add the next product to your shelf." action={<button className="primary-btn" onClick={openNew}><Plus size={16} /> Add product</button>} /></div>}</section><div className="flex flex-wrap items-start gap-2 text-xs leading-5 text-slate-400"><Info size={14} className="mt-0.5" /> Vendor visibility is simulated. Set quantity and vendor price only for products you are comfortable sharing with connected businesses.</div></div>;
}

function ProductEditor({ form, setForm, editing, onSave, onCancel }: { form: ProductFormValues; setForm: Dispatch<SetStateAction<ProductFormValues>>; editing: boolean; onSave: () => void; onCancel: () => void }) {
  const set = (patch: Partial<ProductFormValues>) => setForm((current) => ({ ...current, ...patch }));
  return <section className="surface border-blue-200 p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><div className="eyebrow text-brand">{editing ? "Edit inventory" : "New inventory"}</div><h2 className="mt-1 text-xl font-black">{editing ? "Update product details" : "Add a product"}</h2></div><button className="ghost-btn px-2" onClick={onCancel}><X size={16} /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="lg:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-500">Product name</span><input className="field" value={form.name} onChange={(event) => set({ name: event.target.value })} /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Category</span><input className="field" value={form.category} onChange={(event) => set({ category: event.target.value })} /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Subcategory</span><input className="field" value={form.subcategory} onChange={(event) => set({ subcategory: event.target.value })} /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Stock</span><input className="field" type="number" min="0" value={form.stock} onChange={(event) => set({ stock: Number(event.target.value) })} /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Selling price</span><input className="field" type="number" min="0" value={form.sellingPrice} onChange={(event) => set({ sellingPrice: Number(event.target.value) })} /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Cost price</span><input className="field" type="number" min="0" value={form.costPrice} onChange={(event) => set({ costPrice: Number(event.target.value) })} /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Low-stock threshold</span><input className="field" type="number" min="0" value={form.lowStockThreshold} onChange={(event) => set({ lowStockThreshold: Number(event.target.value) })} /></label><div className="sm:col-span-2 lg:col-span-4"><span className="mb-1.5 block text-xs font-bold text-slate-500">Planning method</span><div className="grid gap-2 sm:grid-cols-2"><button type="button" className={`rounded-xl border p-3 text-left ${form.planningMethod === "FORECAST_AI" ? "border-blue-300 bg-blue-50" : "border-line"}`} onClick={() => set({ planningMethod: "FORECAST_AI" })}><div className="text-sm font-black">Forecast AI</div><div className="mt-1 text-xs text-muted">Three budget levels from sales signals.</div></button><button type="button" className={`rounded-xl border p-3 text-left ${form.planningMethod === "VMI" ? "border-emerald-300 bg-emerald-50" : "border-line"}`} onClick={() => set({ planningMethod: "VMI" })}><div className="text-sm font-black">VMI</div><div className="mt-1 text-xs text-muted">Buy from approved connected businesses.</div></button></div></div><label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={form.isVisibleToConnectedBusinesses} onChange={(event) => set({ isVisibleToConnectedBusinesses: event.target.checked })} className="h-4 w-4 accent-brand" /> Let connected businesses see this inventory</label>{form.isVisibleToConnectedBusinesses && <><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Vendor quantity</span><input className="field" type="number" min="0" value={form.vendorAvailableQuantity} onChange={(event) => set({ vendorAvailableQuantity: Number(event.target.value) })} /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Vendor price</span><input className="field" type="number" min="0" value={form.vendorPrice ?? ""} onChange={(event) => set({ vendorPrice: Number(event.target.value) })} /></label></>}</div><div className="mt-5 flex justify-end gap-2"><button className="secondary-btn" onClick={onCancel}>Cancel</button><button className="primary-btn" onClick={onSave}><Check size={16} /> Save product</button></div></section>;
}

function PlannerTab({ state, updateState, showNotice }: { state: AppState; updateState: (updater: AppState | ((current: AppState) => AppState)) => void; showNotice: (message: string, tone?: Notice["tone"]) => void }) {
  const [personalPercent, setPersonalPercent] = useState(30);
  const fallbackForecastCards = useMemo(() => generateForecastCards(state), [state]);
  const forecastRequest = useMemo<ForecastRequest>(() => {
    const recentUnitsSold = state.transactions.reduce<Record<string, number>>((result, transaction) => {
      if (transaction.paymentStatus !== "PAID") return result;
      transaction.items.forEach((item) => {
        if (item.productId) result[item.productId] = (result[item.productId] ?? 0) + item.quantity;
      });
      return result;
    }, {});
    return {
      products: state.products.filter((product) => product.planningMethod === "FORECAST_AI").map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        stock: product.stock,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        lowStockThreshold: product.lowStockThreshold,
        recentUnitsSold: recentUnitsSold[product.id] ?? 0,
      })),
      availableBusinessFunds: availableBusinessFunds(state),
      salesSummary: { today: todaySales(state), last7Days: weeklySales(state), daysOfHistory: distinctSalesDays(state) },
    };
  }, [state]);
  const { cards: aiForecastCards, mode: forecastMode, loading: forecastLoading } = useGeminiForecastCards(forecastRequest, fallbackForecastCards);
  const vmiCards = useMemo(() => generateVmiCards(state), [state]);
  const generatedCards = useMemo(() => [...aiForecastCards, ...vmiCards], [aiForecastCards, vmiCards]);
  const [cards, setCards] = useState<PlannerCard[]>(generatedCards);
  const [selectedForecastId, setSelectedForecastId] = useState(generatedCards.find((card) => card.source === "FORECAST_AI")?.id ?? "");
  useEffect(() => {
    setCards(generatedCards);
    setSelectedForecastId((current) => generatedCards.some((card) => card.id === current && card.source === "FORECAST_AI") ? current : generatedCards.find((card) => card.source === "FORECAST_AI")?.id ?? "");
  }, [generatedCards]);
  const split = generateAdaptiveSplit(state);
  const adaptiveExplanation = useOptionalAiText(`Write one concise, warm merchant-facing explanation for this suggested split: ${split.reason}`, generatePlannerExplanation(state));
  const days = distinctSalesDays(state);
  const forecastCards = cards.filter((card) => card.source === "FORECAST_AI");
  const currentVmiCards = cards.filter((card) => card.source === "VMI");
  const updateItem = (cardId: string, itemId: string, key: "quantity" | "unitPrice", value: number) => setCards((current) => current.map((card) => card.id === cardId ? { ...card, items: card.items.map((item) => item.id === itemId ? { ...item, [key]: Math.max(0, value), subtotal: key === "quantity" ? Math.max(0, value) * item.unitPrice : item.quantity * Math.max(0, value) } : item), totalCost: card.items.reduce((sum, item) => sum + (item.id === itemId ? (key === "quantity" ? Math.max(0, value) * item.unitPrice : item.quantity * Math.max(0, value)) : item.subtotal), 0) } : card));
  const confirmCard = (card: PlannerCard) => {
    const total = card.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (!total) { showNotice("Add at least one item before confirming a plan.", "error"); return; }
    if (total > availableBusinessFunds(state)) { showNotice("That plan is above available Business Funds. Try a cheaper card or transfer funds first.", "error"); return; }
    const now = new Date().toISOString();
    updateState((current) => ({ ...current, merchant: { ...current.merchant, reservedBusinessFunds: current.merchant.reservedBusinessFunds + total, updatedAt: now }, reservedPlans: [{ id: makeId("plan"), merchantId: current.merchant.id, source: card.source, cardType: card.cardType === "VENDOR" ? card.supplierName : card.label, totalCost: total, status: "CONFIRMED", createdAt: now, items: card.items.map((item) => ({ ...item, id: makeId("plan-item") })) }, ...current.reservedPlans] }));
    showNotice(`${card.label} confirmed. ${peso(total)} reserved from Business Funds.`);
  };
  const acceptSplit = () => {
    const amount = Math.round(split.estimatedProfit * personalPercent / 100);
    if (amount > state.merchant.businessFunds) { showNotice("There is not enough Business Funds for that split yet.", "error"); return; }
    updateState((current) => ({ ...current, merchant: { ...current.merchant, personalFunds: current.merchant.personalFunds + amount, businessFunds: current.merchant.businessFunds - amount, updatedAt: new Date().toISOString() } }));
    showNotice(`${peso(amount)} moved to Personal Funds. The rest stays in the business wallet.`);
  };

  if (!state.plannerUnlocked) return <div className="space-y-6"><SectionTitle eyebrow="Planning studio" title="Planner" description="Turn recent sales into a calmer next buying decision." /><EmptyState icon={Clock3} title="Not enough data yet" description={`Forecast suggestions become more useful after at least 7 days of sales history. Your demo currently has ${days} day${days === 1 ? "" : "s"} of data.`} action={<button className="primary-btn" onClick={() => { updateState((current) => ({ ...current, plannerUnlocked: true })); showNotice("One week of simulated sales data is now available."); }}><Sparkles size={16} /> Simulate 1 week of sales data</button>} /><div className="mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800"><Info size={17} className="mt-0.5 shrink-0" /><span>This shortcut creates demo readiness only. It does not create real sales, personal finance data, or external transactions.</span></div></div>;

  return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><SectionTitle eyebrow="Planning studio" title="Planner" description="From today’s margin to tomorrow’s shelf." action={<Badge tone="green"><CheckCircle2 size={13} /> {plannerDataLabel(state)}</Badge>} /><div className="text-xs font-bold text-slate-400">{days} days of simulated sales history</div></div>
    <section className="surface overflow-hidden"><div className="border-b border-line bg-gradient-to-r from-violet-50 to-blue-50 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="eyebrow text-violet-600">Adaptive Split</div><h2 className="mt-1 text-2xl font-black tracking-tight">Give today’s profit a job.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">GLock suggests a split between Personal Funds and Business Funds based on today’s sales and stock health.</p></div><Badge tone="purple"><Sparkles size={13} /> Demo AI</Badge></div></div><div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><div className="text-sm font-bold text-muted">Estimated today’s profit</div><div className="mt-1 text-4xl font-black tracking-tight text-navy">{peso(split.estimatedProfit)}</div><div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100"><div className="bg-violet-500 transition-all" style={{ width: `${personalPercent}%` }} /><div className="bg-brand transition-all" style={{ width: `${100 - personalPercent}%` }} /></div><div className="mt-3 flex justify-between text-xs font-bold"><span className="text-violet-700">{personalPercent}% Personal</span><span className="text-brand">{100 - personalPercent}% Business</span></div></div><div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-bold text-violet-700">Personal Funds</div><div className="mt-2 text-xl font-black">{peso(Math.round(split.estimatedProfit * personalPercent / 100))}</div></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs font-bold text-brand">Business Funds</div><div className="mt-2 text-xl font-black">{peso(Math.round(split.estimatedProfit * (100 - personalPercent) / 100))}</div></div></div><label className="mt-5 block text-xs font-bold text-slate-500">Adjust your split <input type="range" min="0" max="80" step="5" value={personalPercent} onChange={(event) => setPersonalPercent(Number(event.target.value))} className="mt-3 w-full accent-brand" /></label><p className="mt-4 text-sm leading-6 text-muted">{adaptiveExplanation}</p><div className="mt-4 flex flex-wrap gap-2"><button className="primary-btn" onClick={acceptSplit}><Check size={16} /> Accept split</button><button className="secondary-btn" onClick={() => showNotice("Split adjusted. Review the amounts, then accept when ready.", "info")}><Edit3 size={15} /> Modify</button><button className="ghost-btn" onClick={() => showNotice("Split skipped for this demo day.", "info")}>Reject</button></div></div></div></section>
    <section><SectionTitle eyebrow="Buying suggestions" title="Forecast AI" description="Pick one plan for the next restock run. You can tune every line before confirming." action={<div className="flex items-center gap-2"><Badge tone={forecastLoading || forecastMode === "gemini" ? "purple" : "slate"}>{forecastLoading ? "Generating…" : forecastMode === "gemini" ? "Gemini AI" : "Demo AI"}</Badge><Badge tone="purple">3 budget levels</Badge></div>} /><div className="grid gap-4 xl:grid-cols-3">{forecastCards.map((card) => <PlannerCardView key={card.id} card={card} selected={selectedForecastId === card.id} onSelect={() => setSelectedForecastId(card.id)} onUpdate={updateItem} onConfirm={() => confirmCard(card)} disabled={selectedForecastId !== card.id} />)}</div></section>
    <section><SectionTitle eyebrow="Merchant-to-merchant supply" title="VMI vendor cards" description="Approved connections with visible inventory, matched to your low-stock VMI items." action={<Badge tone="green">{currentVmiCards.length} matches</Badge>} />{currentVmiCards.length ? <div className="grid gap-4 lg:grid-cols-2">{currentVmiCards.map((card) => <PlannerCardView key={card.id} card={card} onUpdate={updateItem} onConfirm={() => confirmCard(card)} />)}</div> : <div className="rounded-3xl border border-dashed border-line bg-slate-50 p-7 text-center text-sm text-muted">No approved VMI match yet. Add a connected supplier or mark more inventory as VMI.</div>}</section>
    <section className="grid gap-4 md:grid-cols-3"><div className="soft-surface p-5"><div className="flex items-center gap-2 text-amber-600"><AlertTriangle size={18} /><span className="text-xs font-black uppercase tracking-[0.12em]">If funds are tight</span></div><h3 className="mt-3 font-black">Keep the shelf moving</h3><p className="mt-1 text-sm leading-6 text-muted">Choose a lower SRP card, buy fewer units, or move a little money from Personal Funds.</p></div><div className="soft-surface p-5"><div className="flex items-center gap-2 text-brand"><ArrowUpRight size={18} /><span className="text-xs font-black uppercase tracking-[0.12em]">Simulated transfer</span></div><h3 className="mt-3 font-black">Transfer from Personal</h3><button className="ghost-btn mt-3 px-0 text-brand" onClick={() => showNotice("A simulated transfer flow would open here in the next iteration.", "info")}>Explore option <ChevronRight size={15} /></button></div><div className="soft-surface p-5"><div className="flex items-center gap-2 text-violet-600"><CircleDollarSign size={18} /><span className="text-xs font-black uppercase tracking-[0.12em]">GLoan</span></div><h3 className="mt-3 font-black">Need a little runway?</h3><p className="mt-1 text-sm leading-6 text-muted">A clearly marked simulated option for the hackathon demo — no real credit decision.</p></div></section>
  </div>;
}

function PlannerCardView({ card, selected = false, disabled = false, onSelect, onUpdate, onConfirm }: { card: PlannerCard; selected?: boolean; disabled?: boolean; onSelect?: () => void; onUpdate: (cardId: string, itemId: string, key: "quantity" | "unitPrice", value: number) => void; onConfirm: () => void }) {
  const total = card.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return <div className={`soft-surface flex flex-col p-5 transition ${selected ? "border-brand ring-2 ring-blue-100" : ""} ${disabled ? "opacity-60" : ""}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="text-lg font-black">{card.label}</h3>{card.source === "FORECAST_AI" && <button type="button" onClick={onSelect} className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-brand bg-brand" : "border-slate-300 bg-white"}`}>{selected && <Check size={12} className="text-white" />}</button>}</div><div className="mt-2 flex flex-wrap gap-2"><Badge tone={card.source === "VMI" ? "green" : selected ? "blue" : "slate"}>{card.badge}</Badge>{card.source === "VMI" && <Badge tone="slate"><ShieldCheck size={12} /> Approved connection</Badge>}</div></div><div className="text-right"><div className="text-xs font-bold text-muted">Estimated total</div><div className="mt-1 text-xl font-black text-navy">{peso(total)}</div></div></div><div className="mt-4 rounded-2xl bg-slate-50 p-3"><div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-slate-400"><span>Buy list</span><span>Edit quantity / price</span></div><div className="space-y-2">{card.items.map((item) => <div key={item.id} className="grid grid-cols-[1fr_52px_68px] items-center gap-2"><div className="min-w-0"><div className="truncate text-xs font-bold">{item.productName}</div><div className="mt-0.5 text-[10px] text-muted">{item.supplierName ?? card.supplierName}</div></div><input className="field px-2 py-1.5 text-xs" type="number" min="0" value={item.quantity} onChange={(event) => onUpdate(card.id, item.id, "quantity", Number(event.target.value))} /><input className="field px-2 py-1.5 text-xs" type="number" min="0" value={item.unitPrice} onChange={(event) => onUpdate(card.id, item.id, "unitPrice", Number(event.target.value))} /></div>)}</div></div><p className="mt-4 min-h-[48px] text-sm leading-6 text-muted"><Sparkles size={14} className="mr-1 inline text-violet-500" />{card.reason}</p><div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4"><div className="text-xs font-bold text-slate-400">Supplier: <span className="text-slate-600">{card.supplierName}</span></div><button className="primary-btn px-3 py-2.5 text-xs" disabled={disabled} onClick={onConfirm}><PackageCheck size={15} /> Confirm plan</button></div></div>;
}

function ConnectedBusinessesTab({ state, updateState, showNotice }: { state: AppState; updateState: (updater: AppState | ((current: AppState) => AppState)) => void; showNotice: (message: string, tone?: Notice["tone"]) => void }) {
  const updateVendor = (id: string, patch: Partial<Vendor>) => updateState((current) => ({ ...current, vendors: current.vendors.map((vendor) => vendor.id === id ? { ...vendor, ...patch } : vendor) }));
  const addRequest = () => {
    const now = new Date().toISOString();
    const vendor: Vendor = { id: makeId("vendor"), businessName: "Tita Lorna Frozen Meat Supply", ownerName: "Lorna Garcia", status: "PENDING", relationshipType: "SUPPLIER", createdAt: now, products: [{ id: makeId("vendor-product"), merchantId: "pending-vendor", name: "Longganisa", category: "Frozen Goods", subcategory: "Ready-to-cook", stock: 90, sellingPrice: 135, costPrice: 95, planningMethod: "VMI", lowStockThreshold: 20, isVisibleToConnectedBusinesses: true, vendorAvailableQuantity: 25, vendorPrice: 95, createdAt: now, updatedAt: now }] };
    updateState((current) => ({ ...current, vendors: [vendor, ...current.vendors] }));
    showNotice("Mock connection request received. Review it below.");
  };
  const updateOwnProduct = (id: string, patch: Partial<Product>) => updateState((current) => ({ ...current, products: current.products.map((product) => product.id === id ? { ...product, ...patch, updatedAt: new Date().toISOString() } : product) }));
  const approved = state.vendors.filter((vendor) => vendor.status === "APPROVED");
  const pending = state.vendors.filter((vendor) => vendor.status === "PENDING");
  return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><SectionTitle eyebrow="Merchant network" title="Connected Businesses" description="Build trusted supply relationships with other GLock merchants." /><button className="primary-btn" onClick={addRequest}><Plus size={16} /> Add mock request</button></div><div className="grid gap-4 sm:grid-cols-3"><StatCard icon={Handshake} label="Approved partners" value={String(approved.length)} detail="Ready for VMI recommendations" tone="green" /><StatCard icon={Clock3} label="Pending requests" value={String(pending.length)} detail="Needs a merchant decision" tone="amber" /><StatCard icon={PackageCheck} label="Visible products" value={String(state.products.filter((product) => product.isVisibleToConnectedBusinesses).length)} detail="Your partner-facing inventory" tone="blue" /></div>
    <section className="surface p-5 sm:p-6"><SectionTitle eyebrow="Your network" title="Business connections" description="Approved partners can share inventory details without exposing private customer or account information." /><div className="space-y-3">{state.vendors.map((vendor) => <div key={vendor.id} className="rounded-2xl border border-line p-4"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="flex min-w-0 items-start gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${vendor.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" : vendor.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}><Store size={18} /></span><div className="min-w-0"><div className="truncate text-sm font-black">{vendor.businessName}</div><div className="mt-1 text-xs text-muted">{vendor.ownerName} · connected {shortDate(vendor.createdAt)}</div><div className="mt-2 flex flex-wrap gap-2"><Badge tone={toneForStatus(vendor.status)} dot>{vendor.status.toLowerCase()}</Badge><Badge tone="slate">{relationshipLabel(vendor.relationshipType)}</Badge><Badge tone="slate">{vendor.products.filter((product) => product.isVisibleToConnectedBusinesses).length} visible products</Badge></div></div></div><div className="flex flex-wrap gap-2 sm:justify-end">{vendor.status === "PENDING" && <><button className="secondary-btn py-2 text-xs" onClick={() => { updateVendor(vendor.id, { status: "APPROVED" }); showNotice(`${vendor.businessName} is now approved.`); }}><Check size={14} /> Approve</button><button className="ghost-btn py-2 text-xs text-rose-500" onClick={() => { updateVendor(vendor.id, { status: "REJECTED" }); showNotice("Connection request rejected.", "info"); }}>Reject</button></>}{vendor.status === "REJECTED" && <button className="secondary-btn py-2 text-xs" onClick={() => updateVendor(vendor.id, { status: "PENDING" })}><RotateCcw size={14} /> Reopen</button>}</div></div>{vendor.status === "APPROVED" && <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">{vendor.products.filter((product) => product.isVisibleToConnectedBusinesses).map((product) => <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div className="min-w-0"><div className="truncate text-xs font-black">{product.name}</div><div className="mt-1 text-[11px] text-muted">{product.category} · {product.vendorAvailableQuantity || product.stock} available</div></div><span className="shrink-0 text-xs font-black text-emerald-700">{peso(product.vendorPrice ?? product.costPrice)} / unit</span></div>)}{!vendor.products.some((product) => product.isVisibleToConnectedBusinesses) && <div className="text-xs text-muted">This partner has no visible inventory yet.</div>}</div>}</div>)}</div></section>
    <section className="surface p-5 sm:p-6"><SectionTitle eyebrow="Partner visibility" title="Your shared inventory" description="Choose what approved businesses can see and use in VMI suggestions." /><div className="grid gap-3 lg:grid-cols-2">{state.products.map((product) => <div key={product.id} className="rounded-2xl border border-line p-4"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand"><Package size={16} /></span><div className="min-w-0"><div className="truncate text-sm font-black">{product.name}</div><div className="mt-1 text-xs text-muted">{product.category} · {product.subcategory}</div></div></div><label className="flex shrink-0 items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={product.isVisibleToConnectedBusinesses} onChange={(event) => updateOwnProduct(product.id, { isVisibleToConnectedBusinesses: event.target.checked })} className="h-4 w-4 accent-brand" /> Share</label></div>{product.isVisibleToConnectedBusinesses && <div className="mt-4 grid grid-cols-2 gap-3"><label><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Allowed quantity</span><input className="field" type="number" min="0" value={product.vendorAvailableQuantity} onChange={(event) => updateOwnProduct(product.id, { vendorAvailableQuantity: Number(event.target.value) })} /></label><label><span className="mb-1.5 block text-[11px] font-bold text-slate-500">Partner price</span><input className="field" type="number" min="0" value={product.vendorPrice ?? ""} placeholder={String(product.costPrice)} onChange={(event) => updateOwnProduct(product.id, { vendorPrice: Number(event.target.value) })} /></label></div>}</div>)}</div></section><div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800"><ShieldCheck size={18} className="mt-0.5 shrink-0" /><span>Privacy by design: GLock connections share product, quantity, and price signals only. Customer names, phone numbers, revenue, and account numbers never appear here.</span></div></div>;
}

function GRadarTab({ state }: { state: AppState }) {
  const [filter, setFilter] = useState("All products");
  const products = ["All products", ...Array.from(new Set(state.radarTransactions.map((row) => row.productName)))];
  const filtered = state.radarTransactions.filter((row) => filter === "All products" || row.productName === filter);
  const productTotals = Object.entries(filtered.reduce<Record<string, number>>((result, row) => { result[row.productName] = (result[row.productName] ?? 0) + row.quantity; return result; }, {})).map(([name, demand]) => ({ name: name.length > 14 ? `${name.slice(0, 13)}…` : name, demand, supply: Math.max(4, Math.round(demand * 0.68)) }));
  const hourly = filtered.reduce<Record<number, number>>((result, row) => { const hour = new Date(row.purchaseTime).getHours(); result[hour] = (result[hour] ?? 0) + row.quantity; return result; }, {});
  const timeData = Array.from({ length: 10 }, (_, index) => index + 10).map((hour) => ({ time: `${hour}:00`, demand: hourly[hour] ?? 0 }));
  const topProduct = productTotals.slice().sort((a, b) => b.demand - a.demand)[0];
  const peak = timeData.slice().sort((a, b) => b.demand - a.demand)[0];
  const totalDemand = filtered.reduce((sum, row) => sum + row.quantity, 0);
  const radarInsight = useOptionalAiText(`Write one concise inventory insight from this anonymized demand summary: ${generateRadarSummary(state)}`, generateRadarSummary(state));
  const areaData = [...filtered].sort((a, b) => new Date(a.purchaseTime).getTime() - new Date(b.purchaseTime).getTime()).map((row, index) => ({ index: index + 1, signal: row.quantity, label: shortDate(row.purchaseTime) }));
  return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><SectionTitle eyebrow="Nearby demand intelligence" title="GRadar" description="Anonymized, aggregated signals to help you restock with more confidence." /><div className="flex items-center gap-2"><Badge tone="green"><ShieldCheck size={13} /> Privacy-safe</Badge><div className="relative"><select className="select-field min-w-[150px] pr-8 text-xs" value={filter} onChange={(event) => setFilter(event.target.value)}>{products.map((product) => <option key={product}>{product}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-400" /></div></div></div><div className="grid gap-4 sm:grid-cols-3"><StatCard icon={TrendingUp} label="Top demand signal" value={topProduct?.name ?? "—"} detail={`${topProduct?.demand ?? 0} nearby units`} tone="blue" /><StatCard icon={Clock3} label="Peak buying window" value={peak?.time ?? "—"} detail="Based on seeded trends" tone="amber" /><StatCard icon={PackageCheck} label="Observed demand" value={`${numberFormat(totalDemand)} units`} detail="Aggregated consented data" tone="green" /></div><section className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5 sm:p-6"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm"><Sparkles size={19} /></div><div><div className="eyebrow text-brand">Demo AI insight</div><p className="mt-2 max-w-3xl text-base font-bold leading-7 text-navy">{radarInsight}</p><p className="mt-2 text-xs text-muted">This insight is generated from seeded, anonymized merchant-type and product-order signals. No customer identity is used.</p></div></div></section><div className="grid gap-6 xl:grid-cols-2"><section className="surface p-5 sm:p-6"><SectionTitle eyebrow="Demand over time" title="Nearby buying signal" description="Unit demand observed across the selected product filter." /><div className="h-[280px] w-full">{areaData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={areaData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}><defs><linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1677ff" stopOpacity={0.28} /><stop offset="100%" stopColor="#1677ff" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#e6edf6" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6edf6", boxShadow: "0 10px 24px rgba(18,51,91,.1)", fontSize: 12 }} /><Area type="monotone" dataKey="signal" stroke="#1677ff" strokeWidth={3} fill="url(#radarFill)" /></AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-muted">No trend rows for this filter.</div>}</div></section><section className="surface p-5 sm:p-6"><SectionTitle eyebrow="Supply vs demand" title="Where the gap is" description="A directional view of nearby demand against the seeded supply signal." /><div className="h-[280px] w-full">{productTotals.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={productTotals} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}><CartesianGrid stroke="#e6edf6" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6edf6", boxShadow: "0 10px 24px rgba(18,51,91,.1)", fontSize: 12 }} /><Bar dataKey="demand" name="Demand" fill="#1677ff" radius={[6, 6, 0, 0]} /><Bar dataKey="supply" name="Supply" fill="#16c8da" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-muted">No supply rows for this filter.</div>}</div></section></div><section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]"><section className="surface p-5 sm:p-6"><SectionTitle eyebrow="Peak buying time" title="When to be ready" description="Demand by hour from the anonymized signal set." /><div className="h-[250px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={timeData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}><CartesianGrid stroke="#e6edf6" vertical={false} /><XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6edf6", boxShadow: "0 10px 24px rgba(18,51,91,.1)", fontSize: 12 }} /><Bar dataKey="demand" name="Units" fill="#7c3aed" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></section><section className="surface p-5 sm:p-6"><SectionTitle eyebrow="Privacy promise" title="Only useful signals" /><div className="space-y-3">{[{ icon: ShieldCheck, title: "Anonymized merchant types", copy: "Food stall, mini grocery, and sari-sari patterns only." }, { icon: Package, title: "Product-level trends", copy: "Order quantity, category, and timing — never a customer identity." }, { icon: Users, title: "No personal profiles", copy: "No names, numbers, revenue, or account details appear in GRadar." }].map(({ icon: Icon, title, copy }) => <div key={title} className="flex gap-3 rounded-2xl bg-slate-50 p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm"><Icon size={16} /></span><div><div className="text-sm font-black">{title}</div><div className="mt-1 text-xs leading-5 text-muted">{copy}</div></div></div>)}</div></section></section><div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500"><Info size={15} className="mt-0.5 shrink-0 text-brand" /> GRadar is a seeded prototype view. It demonstrates privacy-safe demand patterns and does not represent live GCash or merchant network data.</div></div>;
}
