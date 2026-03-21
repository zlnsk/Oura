"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/utils";
import { useTheme } from "@/components/layout/ThemeProvider";
import type { SleepPeriod } from "@/types/oura";

interface SleepStagesChartProps {
  data: SleepPeriod[];
  title?: string;
  height?: number;
}

export function SleepStagesChart({
  data,
  title = "Sleep Stages",
  height = 320,
}: SleepStagesChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = data.map((s) => ({
    day: s.day,
    deep: Math.round(s.deep_sleep_duration / 60),
    rem: Math.round(s.rem_sleep_duration / 60),
    light: Math.round(s.light_sleep_duration / 60),
    awake: Math.round(s.awake_time / 60),
  }));

  return (
    <div className="premium-card p-6">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
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
            label={{ value: "Minutes", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" } }}
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
            formatter={(value: number, name: string) => [`${value} min`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="deep" name="Deep" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
          <Bar dataKey="rem" name="REM" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="light" name="Light" stackId="a" fill="#a78bfa" />
          <Bar dataKey="awake" name="Awake" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
