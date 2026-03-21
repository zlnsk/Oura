"use client";

import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { DateRangeSelector } from "@/components/ui/DateRangeSelector";
import { StatCard } from "@/components/ui/StatCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { ScoreLineChart } from "@/components/charts/ScoreLineChart";
import { SleepStagesChart } from "@/components/charts/SleepStagesChart";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import {
  BedDouble,
  Clock,
  Wind,
  Heart,
  Moon,
  Zap,
  RefreshCw,
} from "lucide-react";
import { average, trend, formatDuration, formatHoursMinutes } from "@/lib/utils";

export default function SleepPage() {
  const { data, loading, fetchData } = useOuraData();

  useEffect(() => {
    if (!data) fetchData();
  }, [data, fetchData]);

  const periods = data?.sleepPeriods || [];
  const dailySleep = data?.sleep || [];
  const latest = periods[periods.length - 1];

  const avgTotal = average(periods.map((p) => p.total_sleep_duration));
  const avgDeep = average(periods.map((p) => p.deep_sleep_duration));
  const avgRem = average(periods.map((p) => p.rem_sleep_duration));
  const avgEfficiency = average(periods.map((p) => p.efficiency));
  const avgHRV = average(periods.map((p) => p.average_hrv));
  const avgHR = average(periods.map((p) => p.average_heart_rate));
  const avgLowestHR = average(periods.map((p) => p.lowest_heart_rate));

  return (
    <DashboardShell>
      <PageHeader
        title="Sleep Analysis"
        subtitle="Detailed sleep metrics and patterns"
        icon={BedDouble}
        iconColor="#6366f1"
        action={
          <div className="flex items-center gap-3">
            <DateRangeSelector />
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
          {/* Latest night overview */}
          <div className="premium-card p-8">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              <ScoreRing
                score={dailySleep[dailySleep.length - 1]?.score || 0}
                size={140}
                strokeWidth={10}
                label="Sleep Score"
              />
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {latest && (
                  <>
                    <div>
                      <p className="stat-label">Total Sleep</p>
                      <p className="text-xl font-bold mt-1">{formatDuration(latest.total_sleep_duration)}</p>
                    </div>
                    <div>
                      <p className="stat-label">Efficiency</p>
                      <p className="text-xl font-bold mt-1">{latest.efficiency}%</p>
                    </div>
                    <div>
                      <p className="stat-label">Deep Sleep</p>
                      <p className="text-xl font-bold mt-1 text-indigo-500">{formatDuration(latest.deep_sleep_duration)}</p>
                    </div>
                    <div>
                      <p className="stat-label">REM Sleep</p>
                      <p className="text-xl font-bold mt-1 text-violet-500">{formatDuration(latest.rem_sleep_duration)}</p>
                    </div>
                    <div>
                      <p className="stat-label">Bedtime</p>
                      <p className="text-xl font-bold mt-1">
                        {new Date(latest.bedtime_start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                    <div>
                      <p className="stat-label">Wake Time</p>
                      <p className="text-xl font-bold mt-1">
                        {new Date(latest.bedtime_end).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
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
              label="Avg Total Sleep"
              value={formatDuration(avgTotal)}
              icon={Clock}
              color="#6366f1"
              trend={trend(periods.map((p) => p.total_sleep_duration))}
              trendPositive={trend(periods.map((p) => p.total_sleep_duration)) === "up"}
            />
            <StatCard
              label="Avg Deep Sleep"
              value={formatDuration(avgDeep)}
              icon={Moon}
              color="#4f46e5"
              trend={trend(periods.map((p) => p.deep_sleep_duration))}
              trendPositive={trend(periods.map((p) => p.deep_sleep_duration)) === "up"}
            />
            <StatCard
              label="Avg HRV"
              value={avgHRV}
              unit="ms"
              icon={Wind}
              color="#8b5cf6"
              trend={trend(periods.map((p) => p.average_hrv))}
              trendPositive={trend(periods.map((p) => p.average_hrv)) === "up"}
            />
            <StatCard
              label="Avg Resting HR"
              value={avgHR}
              unit="bpm"
              icon={Heart}
              color="#f43f5e"
              trend={trend(periods.map((p) => p.average_heart_rate))}
              trendPositive={trend(periods.map((p) => p.average_heart_rate)) === "down"}
            />
          </div>

          {/* Sleep score chart */}
          <ScoreLineChart
            data={dailySleep}
            title="Sleep Score Over Time"
            color="#6366f1"
            gradientId="sleepScoreGrad"
            domain={[40, 100]}
          />

          {/* Sleep stages */}
          <SleepStagesChart data={periods} />

          {/* HRV & HR during sleep */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScoreLineChart
              data={periods.map((p) => ({ day: p.day, score: p.average_hrv }))}
              dataKey="score"
              title="HRV During Sleep"
              color="#8b5cf6"
              gradientId="hrvGrad"
              unit=" ms"
            />
            <MultiLineChart
              data={periods.map((p) => ({
                day: p.day,
                avg: p.average_heart_rate,
                lowest: p.lowest_heart_rate,
              }))}
              lines={[
                { key: "avg", color: "#f43f5e", name: "Avg HR" },
                { key: "lowest", color: "#06b6d4", name: "Lowest HR" },
              ]}
              title="Heart Rate During Sleep"
              unit=" bpm"
            />
          </div>

          {/* Sleep contributors */}
          {dailySleep.length > 0 && (
            <div className="premium-card p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Sleep Score Contributors (Latest)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {dailySleep[dailySleep.length - 1]?.contributors &&
                  Object.entries(dailySleep[dailySleep.length - 1].contributors).map(
                    ([key, value]) => (
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
                    )
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
