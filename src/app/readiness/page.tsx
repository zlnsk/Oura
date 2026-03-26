"use client";

import { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { DateRangeSelector } from "@/components/ui/DateRangeSelector";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { StatCard } from "@/components/ui/StatCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { LazyScoreLineChart as ScoreLineChart, LazyMultiLineChart as MultiLineChart } from "@/components/charts";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";
import { Zap, Thermometer, RefreshCw } from "lucide-react";
import { average, trend } from "@/lib/utils";
import { AISummaryCard } from "@/components/ui/AISummaryCard";

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ReadinessPage() {
  const { data, loading, fetchData } = useOuraData();
  const [selectedDate, setSelectedDate] = useState(getToday());

  useEffect(() => {
    if (!data) fetchData();
  }, [data, fetchData]);

  const readiness = data?.readiness || [];
  const latest = readiness.find((r) => r.day === selectedDate) || readiness[readiness.length - 1];

  return (
    <DashboardShell>
      <PageHeader
        title="Readiness"
        subtitle="Recovery and readiness metrics"
        icon={Zap}
        iconColor="#f59e0b"
        action={
          <div className="flex items-center gap-3">
            <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <button onClick={fetchData} disabled={loading} className="btn-secondary text-sm px-3 py-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      {loading && !data && <LoadingGrid />}
      {!loading && !data && <EmptyState />}

      {data && (
        <div className="space-y-6 animate-fade-in">
          <AISummaryCard page="readiness" data={data} />

          {/* Score overview */}
          <div className="premium-card p-8">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              <ScoreRing
                score={latest?.score || 0}
                size={140}
                strokeWidth={10}
                label="Readiness Score"
              />
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {latest && (
                  <>
                    <div>
                      <p className="stat-label">Temp Deviation</p>
                      <p className="text-xl font-bold mt-1">
                        {latest.temperature_deviation?.toFixed(2) || "--"}°C
                      </p>
                    </div>
                    <div>
                      <p className="stat-label">Temp Trend</p>
                      <p className="text-xl font-bold mt-1">
                        {latest.temperature_trend_deviation?.toFixed(2) || "--"}°C
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Avg Readiness"
              value={average(readiness.map((r) => r.score))}
              icon={Zap}
              color="#f59e0b"
              trend={trend(readiness.map((r) => r.score))}
              trendPositive={trend(readiness.map((r) => r.score)) === "up"}
            />
            <StatCard
              label="Best Score"
              value={Math.max(...readiness.map((r) => r.score), 0)}
              icon={Zap}
              color="#10b981"
            />
            <StatCard
              label="Lowest Score"
              value={readiness.length ? Math.min(...readiness.map((r) => r.score)) : "--"}
              icon={Zap}
              color="#f43f5e"
            />
            <StatCard
              label="Avg Temp Dev"
              value={
                average(readiness.map((r) => Math.round((r.temperature_deviation || 0) * 100))) / 100
              }
              unit="°C"
              icon={Thermometer}
              color="#06b6d4"
            />
          </div>

          {/* Trends */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trends</h3>
            <DateRangeSelector />
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <ScoreLineChart
              data={readiness}
              title="Readiness Score Trend"
              color="#f59e0b"
              gradientId="readScoreGrad"
              domain={[40, 100]}
            />

            {/* Temperature */}
            <MultiLineChart
              data={readiness.map((r) => ({
                day: r.day,
                deviation: Number((r.temperature_deviation || 0).toFixed(2)),
                trend: Number((r.temperature_trend_deviation || 0).toFixed(2)),
              }))}
              lines={[
                { key: "deviation", color: "#f43f5e", name: "Temp Deviation" },
                { key: "trend", color: "#06b6d4", name: "Temp Trend" },
              ]}
              title="Body Temperature Deviation"
              unit="°C"
            />
          </Suspense>

          {/* Contributors */}
          {latest?.contributors && (
            <div className="premium-card p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Readiness Contributors (Latest)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {Object.entries(latest.contributors).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <ScoreRing
                      score={value as number}
                      size={64}
                      strokeWidth={5}
                      className="mx-auto"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
