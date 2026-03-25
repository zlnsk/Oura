"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";
import { useTheme } from "@/components/layout/ThemeProvider";

interface LineConfig {
  key: string;
  color: string;
  name: string;
}

interface MultiLineChartProps {
  data: object[];
  lines: LineConfig[];
  title?: string;
  height?: number;
  unit?: string;
}

export const MultiLineChart = memo(function MultiLineChart({
  data,
  lines,
  title,
  height = 280,
  unit = "",
}: MultiLineChartProps) {
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
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
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
            formatter={(value: number, name: string) => [`${value}${unit}`, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
          {lines.map(({ key, color, name }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              name={name}
              dot={false}
              connectNulls
              activeDot={{ r: 4, fill: color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
