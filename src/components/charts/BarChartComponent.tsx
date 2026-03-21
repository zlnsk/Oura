"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatDate } from "@/lib/utils";
import { useTheme } from "@/components/layout/ThemeProvider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface BarChartComponentProps {
  data: any[];
  dataKey: string;
  color?: string;
  title?: string;
  height?: number;
  unit?: string;
}

export function BarChartComponent({
  data,
  dataKey,
  color = "#0c93e9",
  title,
  height = 280,
  unit = "",
}: BarChartComponentProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="premium-card p-6">
      {title && (
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#1e293b" : "#e2e8f0"}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1e1e2a" : "#ffffff",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              padding: "12px 16px",
            }}
            labelFormatter={(label) => formatDate(label as string)}
            formatter={(value: number) => [`${value}${unit}`, dataKey]}
          />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
