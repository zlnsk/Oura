"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useTheme } from "@/components/layout/ThemeProvider";

interface IntradayChartProps {
  data: { time: string; value: number }[];
  title?: string;
  height?: number;
  color?: string;
  unit?: string;
  avgValue?: number;
  gradientId?: string;
  domain?: [number, number];
}

export function IntradayChart({
  data,
  title,
  height = 200,
  color = "#f43f5e",
  unit = "",
  avgValue,
  gradientId = "intradayGrad",
  domain,
}: IntradayChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (data.length === 0) {
    return (
      <div className="premium-card p-6">
        {title && (
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center h-[120px] text-xs text-slate-400">
          No data available for this day
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card p-6">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {title}
          </h3>
          {avgValue !== undefined && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Avg: <span className="font-semibold" style={{ color }}>{avgValue}{unit}</span>
            </span>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#1e293b" : "#e2e8f0"}
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={domain || ["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1e1e2a" : "#ffffff",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              padding: "8px 12px",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value}${unit}`, ""]}
            labelFormatter={(label) => `${label}`}
          />
          {avgValue !== undefined && (
            <ReferenceLine
              y={avgValue}
              stroke={color}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
