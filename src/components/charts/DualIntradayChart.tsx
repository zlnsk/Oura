"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "@/components/layout/ThemeProvider";

interface DualIntradayChartProps {
  data: { time: string; hr?: number; met?: number }[];
  title?: string;
  height?: number;
}

export const DualIntradayChart = memo(function DualIntradayChart({
  data,
  title,
  height = 250,
}: DualIntradayChartProps) {
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

  const hrValues = data.map((d) => d.hr).filter((v): v is number => v != null);
  const avgHR = hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : null;
  const avgMET = (() => {
    const metValues = data.map((d) => d.met).filter((v): v is number => v != null);
    return metValues.length > 0 ? Math.round(metValues.reduce((a, b) => a + b, 0) / metValues.length * 10) / 10 : null;
  })();

  return (
    <div className="premium-card p-6">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {avgHR !== null && (
              <span>Avg HR: <span className="font-semibold text-rose-500">{avgHR} bpm</span></span>
            )}
            {avgMET !== null && (
              <span>Avg MET: <span className="font-semibold text-amber-500">{avgMET}</span></span>
            )}
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
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
            yAxisId="hr"
            tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <YAxis
            yAxisId="met"
            orientation="right"
            tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 10]}
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
            formatter={(value: number, name: string) => {
              if (name === "hr") return [`${value} bpm`, "Heart Rate"];
              if (name === "met") return [`${value}`, "MET"];
              return [value, name];
            }}
          />
          <Legend
            verticalAlign="top"
            height={28}
            formatter={(value: string) => {
              if (value === "hr") return "Heart Rate";
              if (value === "met") return "MET";
              return value;
            }}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar
            yAxisId="met"
            dataKey="met"
            fill="#f59e0b"
            fillOpacity={0.35}
            radius={[1, 1, 0, 0]}
          />
          <Line
            yAxisId="hr"
            type="monotone"
            dataKey="hr"
            stroke="#f43f5e"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#f43f5e" }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});
