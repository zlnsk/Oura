"use client";

import { useEffect, useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { DateRangeSelector } from "@/components/ui/DateRangeSelector";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { ScoreLineChart } from "@/components/charts/ScoreLineChart";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { Heart, TrendingDown, Activity, Wind, RefreshCw } from "lucide-react";
import { average, trend } from "@/lib/utils";

export default function HeartRatePage() {
  const { data, loading, fetchData } = useOuraData();

  useEffect(() => {
    if (!data) fetchData();
  }, [data, fetchData]);

  const heartRate = data?.heartRate || [];
  const sleepPeriods = data?.sleepPeriods || [];

  // Aggregate HR data by day
  const dailyHR = useMemo(() => {
    const byDay: Record<string, number[]> = {};
    heartRate.forEach((hr) => {
      const day = hr.timestamp.split("T")[0];
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(hr.bpm);
    });
    return Object.entries(byDay)
      .map(([day, bpms]) => ({
        day,
        avg: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length),
        max: Math.max(...bpms),
        min: Math.min(...bpms),
      }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [heartRate]);

  // HR distribution
  const hrDistribution = useMemo(() => {
    const ranges = [
      { label: "<50", min: 0, max: 50 },
      { label: "50-60", min: 50, max: 60 },
      { label: "60-70", min: 60, max: 70 },
      { label: "70-80", min: 70, max: 80 },
      { label: "80-90", min: 80, max: 90 },
      { label: "90-100", min: 90, max: 100 },
      { label: "100+", min: 100, max: 999 },
    ];
    return ranges.map(({ label, min, max }) => ({
      day: label,
      count: heartRate.filter((hr) => hr.bpm >= min && hr.bpm < max).length,
    }));
  }, [heartRate]);

  const avgRestingHR = average(sleepPeriods.map((s) => s.average_heart_rate));
  const avgLowestHR = average(sleepPeriods.map((s) => s.lowest_heart_rate));
  const avgHRV = average(sleepPeriods.map((s) => s.average_hrv));
  const overallAvg = average(dailyHR.map((d) => d.avg));

  return (
    <DashboardShell>
      <PageHeader
        title="Heart Rate"
        subtitle="Heart rate and HRV analysis"
        icon={Heart}
        iconColor="#f43f5e"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Avg Resting HR"
              value={avgRestingHR}
              unit="bpm"
              icon={Heart}
              color="#f43f5e"
              trend={trend(sleepPeriods.map((s) => s.average_heart_rate))}
              trendPositive={trend(sleepPeriods.map((s) => s.average_heart_rate)) === "down"}
            />
            <StatCard
              label="Avg Lowest HR"
              value={avgLowestHR}
              unit="bpm"
              icon={TrendingDown}
              color="#06b6d4"
              trend={trend(sleepPeriods.map((s) => s.lowest_heart_rate))}
              trendPositive={trend(sleepPeriods.map((s) => s.lowest_heart_rate)) === "down"}
            />
            <StatCard
              label="Avg Daytime HR"
              value={overallAvg}
              unit="bpm"
              icon={Activity}
              color="#f59e0b"
            />
            <StatCard
              label="Avg HRV"
              value={avgHRV}
              unit="ms"
              icon={Wind}
              color="#8b5cf6"
              trend={trend(sleepPeriods.map((s) => s.average_hrv))}
              trendPositive={trend(sleepPeriods.map((s) => s.average_hrv)) === "up"}
            />
          </div>

          {/* Daily HR trends */}
          <MultiLineChart
            data={dailyHR}
            lines={[
              { key: "max", color: "#f43f5e", name: "Max HR" },
              { key: "avg", color: "#f59e0b", name: "Avg HR" },
              { key: "min", color: "#06b6d4", name: "Min HR" },
            ]}
            title="Daily Heart Rate Range"
            unit=" bpm"
            height={320}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resting HR during sleep */}
            <MultiLineChart
              data={sleepPeriods.map((s) => ({
                day: s.day,
                avg: s.average_heart_rate,
                lowest: s.lowest_heart_rate,
              }))}
              lines={[
                { key: "avg", color: "#f43f5e", name: "Avg HR" },
                { key: "lowest", color: "#06b6d4", name: "Lowest HR" },
              ]}
              title="Heart Rate During Sleep"
              unit=" bpm"
            />

            {/* HRV trend */}
            <ScoreLineChart
              data={sleepPeriods.map((s) => ({
                day: s.day,
                score: s.average_hrv,
              }))}
              dataKey="score"
              title="HRV Trend"
              color="#8b5cf6"
              gradientId="hrvTrendGrad"
              unit=" ms"
            />
          </div>

          {/* HR distribution */}
          <BarChartComponent
            data={hrDistribution}
            dataKey="count"
            title="Heart Rate Distribution"
            color="#f43f5e"
            unit=" readings"
          />
        </div>
      )}
    </DashboardShell>
  );
}
