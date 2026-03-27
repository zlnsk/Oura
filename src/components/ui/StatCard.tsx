"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendLabel?: string;
  trendPositive?: boolean;
  color?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  trendPositive,
  color,
  className,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "premium-card p-5 group cursor-default",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight" style={color ? { color } : undefined}>
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-gray-400">{unit}</span>
            )}
          </div>
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: color ? `${color}10` : undefined,
              color: color || undefined,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendIcon
            className={cn(
              "w-3.5 h-3.5",
              trendPositive === undefined
                ? "text-gray-400"
                : trendPositive
                ? "text-emerald-500"
                : "text-rose-500"
            )}
          />
          {trendLabel && (
            <span
              className={cn(
                "text-xs font-medium",
                trendPositive === undefined
                  ? "text-gray-400"
                  : trendPositive
                  ? "text-emerald-500"
                  : "text-rose-500"
              )}
            >
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
