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
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import {
  Activity,
  Footprints,
  Flame,
  Timer,
  Target,
  RefreshCw,
} from "lucide-react";
import { average, trend, formatDuration } from "@/lib/utils";

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ActivityPage() {
  const { data, loading, fetchData } = useOuraData();

  useEffect(() => {
    if (!data) fetchData();
  }, [data, fetchData]);

  const activities = data?.activity || [];
  const today = getToday();
  const latest = activities.find((a) => a.day === today) || activities[activities.length - 1];

  const avgSteps = average(activities.map((a) => a.steps));
  const avgCalories = average(activities.map((a) => a.total_calories));

  return (
    <DashboardShell>
      <PageHeader
        title="Activity"
        subtitle="Movement, steps, and calorie tracking"
        icon={Activity}
        iconColor="#10b981"
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
          {/* Overview */}
          <div className="premium-card p-8">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              <ScoreRing
                score={latest?.score || 0}
                size={140}
                strokeWidth={10}
                label="Activity Score"
              />
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {latest && (
                  <>
                    <div>
                      <p className="stat-label">Steps</p>
                      <p className="text-xl font-bold mt-1">{latest.steps?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="stat-label">Total Calories</p>
                      <p className="text-xl font-bold mt-1">{latest.total_calories?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="stat-label">Active Calories</p>
                      <p className="text-xl font-bold mt-1">{latest.active_calories?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="stat-label">Walking Distance</p>
                      <p className="text-xl font-bold mt-1">
                        {((latest.equivalent_walking_distance || 0) / 1000).toFixed(1)} km
                      </p>
                    </div>
                    <div>
                      <p className="stat-label">High Activity</p>
                      <p className="text-xl font-bold mt-1">{formatDuration(latest.high_activity_time || 0)}</p>
                    </div>
                    <div>
                      <p className="stat-label">Medium Activity</p>
                      <p className="text-xl font-bold mt-1">{formatDuration(latest.medium_activity_time || 0)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Avg Daily Steps"
              value={avgSteps.toLocaleString()}
              icon={Footprints}
              color="#10b981"
              trend={trend(activities.map((a) => a.steps))}
              trendPositive={trend(activities.map((a) => a.steps)) === "up"}
            />
            <StatCard
              label="Avg Calories"
              value={avgCalories.toLocaleString()}
              unit="cal"
              icon={Flame}
              color="#f59e0b"
            />
            <StatCard
              label="Avg Active Time"
              value={formatDuration(
                average(
                  activities.map(
                    (a) =>
                      (a.high_activity_time || 0) + (a.medium_activity_time || 0)
                  )
                )
              )}
              icon={Timer}
              color="#06b6d4"
            />
            <StatCard
              label="Inactivity Alerts"
              value={latest?.inactivity_alerts || 0}
              icon={Target}
              color="#f43f5e"
            />
          </div>

          {/* Charts */}
          <ScoreLineChart
            data={activities}
            title="Activity Score Trend"
            color="#10b981"
            gradientId="actScoreGrad"
            domain={[40, 100]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartComponent
              data={activities.map((a) => ({ day: a.day, steps: a.steps }))}
              dataKey="steps"
              title="Daily Steps"
              color="#10b981"
            />
            <BarChartComponent
              data={activities.map((a) => ({
                day: a.day,
                calories: a.total_calories,
              }))}
              dataKey="calories"
              title="Daily Calories"
              color="#f59e0b"
              unit=" cal"
            />
          </div>

          <MultiLineChart
            data={activities.map((a) => ({
              day: a.day,
              high: Math.round((a.high_activity_time || 0) / 60),
              medium: Math.round((a.medium_activity_time || 0) / 60),
              low: Math.round((a.low_activity_time || 0) / 60),
            }))}
            lines={[
              { key: "high", color: "#f43f5e", name: "High (min)" },
              { key: "medium", color: "#f59e0b", name: "Medium (min)" },
              { key: "low", color: "#06b6d4", name: "Low (min)" },
            ]}
            title="Activity Levels Over Time"
            unit=" min"
          />

          {/* Contributors */}
          {latest?.contributors && (
            <div className="premium-card p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Activity Score Contributors (Latest)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
