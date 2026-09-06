"use client";

import Link from "next/link";
import { ChevronRight, RotateCcw, Store } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { Badge } from "@/components/ui";

export function SiteHeader() {
  const { resetDemo } = useDemoStore();
  return <header className="border-b border-line bg-white/90 backdrop-blur"><div className="app-container flex min-h-[70px] items-center justify-between gap-4"><Link href="/" className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cyan text-white shadow-sm"><Store size={19} strokeWidth={2.7} /></span><span className="min-w-0"><span className="block truncate text-lg font-black tracking-tight text-navy">GLock</span><span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:block">merchant workspace</span></span></Link><div className="hidden items-center gap-2 md:flex"><Link href="/view-more" className="ghost-btn">GCash home <ChevronRight size={14} /></Link><Link href="/glock/dashboard" className="ghost-btn">Dashboard <ChevronRight size={14} /></Link><Badge tone="amber">Prototype only</Badge><button className="ghost-btn text-slate-400" onClick={resetDemo} title="Reset seeded demo data"><RotateCcw size={14} /> Reset</button></div><div className="flex items-center gap-2 md:hidden"><Badge tone="amber">Demo</Badge><button className="ghost-btn px-2" onClick={resetDemo} title="Reset seeded demo data"><RotateCcw size={16} /></button></div></div></header>;
}
