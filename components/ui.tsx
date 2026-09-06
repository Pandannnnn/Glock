"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export type Tone = "blue" | "green" | "amber" | "red" | "slate" | "purple";

const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  red: "bg-rose-50 text-rose-700 border-rose-100",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  purple: "bg-violet-50 text-violet-700 border-violet-100",
};

export function Badge({ children, tone = "blue", dot = false }: { children: ReactNode; tone?: Tone; dot?: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${toneClasses[tone]}`}>{dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}</span>;
}

export function SectionTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-5 flex items-end justify-between gap-4"><div>{eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}<h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">{title}</h2>{description && <p className="mt-1 text-sm text-muted">{description}</p>}</div>{action}</div>;
}

export function StatCard({ icon: Icon, label, value, detail, tone = "blue", trend }: { icon: LucideIcon; label: string; value: string; detail?: string; tone?: Tone; trend?: string }) {
  const iconClasses: Record<Tone, string> = { blue: "bg-blue-50 text-brand", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", red: "bg-rose-50 text-rose-600", slate: "bg-slate-100 text-slate-600", purple: "bg-violet-50 text-violet-600" };
  return <div className="soft-surface p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconClasses[tone]}`}><Icon size={18} strokeWidth={2.4} /></div>{trend && <span className="text-xs font-bold text-emerald-600">{trend}</span>}</div><div className="mt-5"><div className="text-xs font-bold text-muted">{label}</div><div className="mt-1 text-2xl font-black tracking-tight text-ink">{value}</div>{detail && <div className="mt-1 text-xs text-slate-400">{detail}</div>}</div></div>;
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/50 px-6 py-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand shadow-soft"><Icon size={24} /></div><h3 className="mt-4 text-lg font-black text-ink">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function LinkArrow() { return <ArrowUpRight size={16} />; }

export function Toast({ message, tone = "success", onClose }: { message: string; tone?: "success" | "error" | "info"; onClose?: () => void }) {
  const classes = tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : tone === "info" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return <div className={`fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-bold shadow-card ${classes}`}><span>{message}</span>{onClose && <button className="text-current/60" onClick={onClose}>×</button>}</div>;
}
