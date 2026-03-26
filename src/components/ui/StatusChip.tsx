"use client";

import { cn } from "@/lib/utils";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

type StatusVariant = "synced" | "syncing" | "stale" | "offline" | "error";

const variants: Record<StatusVariant, { icon: typeof Wifi; label: string; classes: string }> = {
  synced: { icon: CheckCircle2, label: "Synced", classes: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.08]" },
  syncing: { icon: RefreshCw, label: "Syncing", classes: "text-oura-600 dark:text-oura-400 bg-oura-500/[0.08]" },
  stale: { icon: Clock, label: "Stale", classes: "text-amber-600 dark:text-amber-400 bg-amber-500/[0.08]" },
  offline: { icon: WifiOff, label: "Offline", classes: "text-slate-500 dark:text-slate-400 bg-slate-500/[0.08]" },
  error: { icon: AlertTriangle, label: "Error", classes: "text-rose-600 dark:text-rose-400 bg-rose-500/[0.08]" },
};

interface StatusChipProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusChip({ variant, label, className }: StatusChipProps) {
  const v = variants[variant];
  const Icon = v.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium", v.classes, className)}>
      <Icon className={cn("w-3 h-3", variant === "syncing" && "animate-spin")} />
      {label || v.label}
    </span>
  );
}
