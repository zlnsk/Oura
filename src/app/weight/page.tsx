"use client";

import { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { DateRangeSelector } from "@/components/ui/DateRangeSelector";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import {
  LazyScoreLineChart as ScoreLineChart,
  LazyMultiLineChart as MultiLineChart,
} from "@/components/charts";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";
import { Scale, TrendingDown, TrendingUp, Target, Droplets, RefreshCw } from "lucide-react";
import { trend } from "@/lib/utils";
import { COLORS } from "@/lib/constants";
import { AISummaryCard } from "@/components/ui/AISummaryCard";
import type { WithingsWeightEntry } from "@/types/oura";

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatWeight(kg: number): string {
  return (Math.round(kg * 10) / 10).toFixed(1);
}

export default function WeightPage() {
  const { data, loading, fetchData } = useOuraData();
  const [selectedDate, setSelectedDate] = useState(getToday());

  useEffect(() => {
    if (!data) fetchData();
  }, [data, fetchData]);

  const weight = (data?.weight || []) as WithingsWeightEntry[];

  const latest =
    weight.find((w) => w.day === selectedDate) ||
    weight[weight.length - 1];

  const weights = weight.map((w) => w.weight).filter((v) => v > 0);
  const avgWeight = weights.length
    ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10
    : 0;
  const minWeight = weights.length ? Math.min(...weights) : 0;
  const maxWeight = weights.length ? Math.max(...weights) : 0;
  const weightTrend = trend(weights);

  const fatRatios = weight
    .map((w) => w.fat_ratio)
    .filter((v): v is number => v != null && v > 0);
  const avgFatRatio = fatRatios.length
    ? Math.round((fatRatios.reduce((a, b) => a + b, 0) / fatRatios.length) * 10) / 10
    : null;

  const hasBodyComp = weight.some(
    (w) => w.fat_ratio != null || w.muscle_mass != null
  );

  const noWithingsData = weight.length === 0 && !loading;

  return (
    <DashboardShell>
      <PageHeader
        title="Weight"
        subtitle="Body weight and composition from Withings"
        icon={Scale}
        iconColor={COLORS.weight}
        action={
          <div className="flex items-center gap-3">
            <DateNavigator
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="rounded-full p-2 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        }
      />

      {loading && !data && <LoadingGrid />}

      {noWithingsData && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6">
            <Scale className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No weight data available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
            Connect your Withings account in Settings to see your weight and body composition data here.
          </p>
        </div>
      )}

      {data && weight.length > 0 && (
        <div className="space-y-6">
          <AISummaryCard page="weight" data={data} />

          {/* Today's / Selected measurement */}
          {latest && (
            <div className="premium-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {latest.day === getToday() ? "Today" : latest.day}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Latest measurement
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {formatWeight(latest.weight)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Weight (kg)</p>
                </div>
                {latest.fat_ratio != null && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">
                      {latest.fat_ratio.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Body Fat</p>
                  </div>
                )}
                {latest.muscle_mass != null && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-500">
                      {formatWeight(latest.muscle_mass)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Muscle (kg)</p>
                  </div>
                )}
                {latest.fat_mass_weight != null && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">
                      {formatWeight(latest.fat_mass_weight)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Fat Mass (kg)</p>
                  </div>
                )}
                {latest.bone_mass != null && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-500">
                      {formatWeight(latest.bone_mass)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Bone Mass (kg)</p>
                  </div>
                )}
                {latest.hydration != null && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-500">
                      {formatWeight(latest.hydration)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Hydration (kg)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Average Weight"
              value={avgWeight ? formatWeight(avgWeight) : "--"}
              unit="kg"
              icon={Scale}
              color={COLORS.weight}
            />
            <StatCard
              label="Weight Trend"
              value={
                weightTrend === "up"
                  ? "Gaining"
                  : weightTrend === "down"
                  ? "Losing"
                  : "Stable"
              }
              icon={weightTrend === "down" ? TrendingDown : TrendingUp}
              color={COLORS.weight}
              trend={weightTrend}
            />
            <StatCard
              label="Range"
              value={
                minWeight && maxWeight
                  ? `${formatWeight(minWeight)} – ${formatWeight(maxWeight)}`
                  : "--"
              }
              unit="kg"
              icon={Target}
              color={COLORS.weight}
            />
            <StatCard
              label="Avg Body Fat"
              value={avgFatRatio != null ? avgFatRatio.toFixed(1) : "--"}
              unit="%"
              icon={Droplets}
              color={COLORS.calories}
            />
          </div>

          {/* Trends header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Trends
            </h3>
            <DateRangeSelector />
          </div>

          {/* Weight trend chart */}
          <Suspense fallback={<ChartSkeleton />}>
            <ScoreLineChart
              data={weight.map((w) => ({
                day: w.day,
                score: w.weight,
              }))}
              title="Weight Over Time"
              color={COLORS.weight}
              gradientId="weightGrad"
            />
          </Suspense>

          {/* Body composition chart */}
          {hasBodyComp && (
            <Suspense fallback={<ChartSkeleton />}>
              <MultiLineChart
                data={weight
                  .filter(
                    (w) => w.fat_ratio != null || w.muscle_mass != null
                  )
                  .map((w) => ({
                    day: w.day,
                    fat: w.fat_ratio ?? 0,
                    muscle: w.muscle_mass ?? 0,
                    fatMass: w.fat_mass_weight ?? 0,
                  }))}
                lines={[
                  {
                    key: "muscle",
                    color: "#6366f1",
                    name: "Muscle Mass (kg)",
                  },
                  {
                    key: "fatMass",
                    color: "#f59e0b",
                    name: "Fat Mass (kg)",
                  },
                ]}
                title="Body Composition Over Time"
              />

              <ScoreLineChart
                data={weight
                  .filter((w) => w.fat_ratio != null)
                  .map((w) => ({
                    day: w.day,
                    score: w.fat_ratio!,
                  }))}
                title="Body Fat % Over Time"
                color={COLORS.calories}
                gradientId="fatRatioGrad"
              />
            </Suspense>
          )}

          {/* Measurement log */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
              Recent Measurements
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-800/40">
                    <th className="text-left py-2 px-3 font-medium text-slate-500">Date</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-500">Weight</th>
                    {hasBodyComp && (
                      <>
                        <th className="text-right py-2 px-3 font-medium text-slate-500">Body Fat</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-500">Muscle</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {weight
                    .slice()
                    .reverse()
                    .slice(0, 30)
                    .map((w) => (
                      <tr
                        key={w.timestamp}
                        className="border-b border-slate-100/60 dark:border-slate-800/20 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{w.day}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatWeight(w.weight)} kg</td>
                        {hasBodyComp && (
                          <>
                            <td className="py-2 px-3 text-right text-slate-500">
                              {w.fat_ratio != null ? `${w.fat_ratio.toFixed(1)}%` : "–"}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-500">
                              {w.muscle_mass != null ? `${formatWeight(w.muscle_mass)} kg` : "–"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
