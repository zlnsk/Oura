"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-8", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${iconColor || "#0c93e9"}, ${iconColor || "#8b5cf6"})`,
              boxShadow: `0 8px 20px -4px ${iconColor || "#0c93e9"}40`,
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
