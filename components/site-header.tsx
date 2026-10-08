"use client";

import Link from "next/link";
import { ChevronRight, LogIn, LogOut, RotateCcw, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/lib/demo-store";

export function SiteHeader() {
  const router = useRouter();
  const { resetDemo, state } = useDemoStore();
  const { user, hydrated: authHydrated, signOut } = useAuth();
  const dashboardHref = user ? "/glock/dashboard" : "/glock/login";

  const handleSignOut = () => {
    signOut();
    router.push("/glock/login");
  };

  return <header className="border-b border-line bg-white/90 backdrop-blur"><div className="app-container flex min-h-[70px] items-center justify-between gap-4"><Link href="/" className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cyan text-white shadow-sm"><Store size={19} strokeWidth={2.7} /></span><span className="min-w-0"><span className="block truncate text-lg font-black tracking-tight text-navy">GLock</span><span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:block">merchant workspace</span></span></Link><div className="hidden items-center gap-2 md:flex"><Link href="/view-more" className="ghost-btn">GCash home <ChevronRight size={14} /></Link><Link href={dashboardHref} className="ghost-btn">Dashboard <ChevronRight size={14} /></Link>{authHydrated && user ? <><Badge tone="green">{state.merchant.businessName}</Badge><Link href="/glock/login" className="ghost-btn">Switch account</Link><button className="ghost-btn text-slate-400" onClick={handleSignOut}><LogOut size={14} /> Sign out</button></> : <Link href="/glock/login" className="primary-btn py-2"><LogIn size={14} /> Sign in</Link>}<Badge tone="amber">Prototype only</Badge><button className="ghost-btn text-slate-400" onClick={resetDemo} title="Reset all seeded demo accounts"><RotateCcw size={14} /> Reset</button></div><div className="flex items-center gap-2 md:hidden">{authHydrated && user ? <><Badge tone="green">{user.username}</Badge><Link href="/glock/login" className="ghost-btn px-2" title="Switch account"><LogIn size={16} /></Link><button className="ghost-btn px-2 text-slate-400" onClick={handleSignOut} title="Sign out"><LogOut size={16} /></button></> : <Link href="/glock/login" className="ghost-btn px-2" title="Sign in"><LogIn size={16} /></Link>}<Badge tone="amber">Demo</Badge><button className="ghost-btn px-2" onClick={resetDemo} title="Reset all seeded demo accounts"><RotateCcw size={16} /></button></div></div></header>;
}
