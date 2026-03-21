"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { DateRangeSelector } from "@/components/ui/DateRangeSelector";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { ScoreLineChart } from "@/components/charts/ScoreLineChart";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { Brain, Shield, Gauge, Wind, RefreshCw } from "lucide-react";
import { average, trend } from "@/lib/utils";

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function StressPage() {
  const { data, loading, fetchData } = useOuraData();
  const [selectedDate, setSelectedDate] = useState(getToday());

  useEffect(() => {
    if (!data) fetchData();
  }, [data, fetchData]);

  const stress = data?.stress || [];
  const resilience = data?.resilience || [];
  const spo2 = data?.spo2 || [];
  const cardiovascularAge = data?.cardiovascularAge || [];
  const vo2Max = data?.vo2Max || [];

  const latest = stress.find((s) => s.day === selectedDate) || stress[stress.length - 1];

  return (
    <DashboardShell>
      <PageHeader
        title="Stress & Resilience"
        subtitle="Stress levels, SpO2, and cardiovascular metrics"
        icon={Brain}
        iconColor="#8b5cf6"
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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Stress Level"
              value={latest?.day_summary || "--"}
              icon={Brain}
              color="#8b5cf6"
            />
            <StatCard
              label="Avg Recovery"
              value={average(stress.map((s) => s.recovery_high || 0))}
              unit="min"
              icon={Shield}
              color="#10b981"
            />
            <StatCard
              label="Avg SpO2"
              value={
                spo2.length
                  ? average(spo2.map((s) => s.spo2_percentage?.average || 0))
                  : "--"
              }
              unit="%"
              icon={Wind}
              color="#06b6d4"
            />
            <StatCard
              label="Cardiovascular Age"
              value={
                cardiovascularAge.length
                  ? cardiovascularAge[cardiovascularAge.length - 1]?.vascular_age || "--"
                  : "--"
              }
              unit="yrs"
              icon={Gauge}
              color="#f43f5e"
            />
          </div>

          {/* Trends */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trends</h3>
            <DateRangeSelector />
          </div>

          {/* Stress over time */}
          {stress.length > 0 && (
            <MultiLineChart
              data={stress.map((s) => ({
                day: s.day,
                stress: s.stress_high || 0,
                recovery: s.recovery_high || 0,
                daytime: s.daytime_recovery || 0,
              }))}
              lines={[
                { key: "stress", color: "#f43f5e", name: "Stress (min)" },
                { key: "recovery", color: "#10b981", name: "Recovery (min)" },
                { key: "daytime", color: "#06b6d4", name: "Daytime Recovery (min)" },
              ]}
              title="Stress vs Recovery Over Time"
              unit=" min"
              height={320}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SpO2 */}
            {spo2.length > 0 && (
              <ScoreLineChart
                data={spo2.map((s) => ({
                  day: s.day,
                  score: s.spo2_percentage?.average || 0,
                }))}
                dataKey="score"
                title="Blood Oxygen (SpO2)"
                color="#06b6d4"
                gradientId="spo2Grad"
                unit="%"
                domain={[90, 100]}
              />
            )}

            {/* VO2 Max */}
            {vo2Max.length > 0 && (
              <ScoreLineChart
                data={vo2Max.map((v) => ({
                  day: v.day,
                  score: v.vo2_max,
                }))}
                dataKey="score"
                title="VO2 Max"
                color="#10b981"
                gradientId="vo2Grad"
                unit=" ml/kg/min"
              />
            )}
          </div>

          {/* Resilience */}
          {resilience.length > 0 && (
            <div className="premium-card p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Resilience Levels
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {resilience.slice(-14).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {r.day}
                    </span>
                    <span
                      className={`badge ${
                        r.level === "exceptional" || r.level === "strong"
                          ? "badge-success"
                          : r.level === "adequate"
                          ? "badge-warning"
                          : "badge-danger"
                      }`}
                    >
                      {r.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cardiovascular Age trend */}
          {cardiovascularAge.length > 0 && (
            <ScoreLineChart
              data={cardiovascularAge.map((c) => ({
                day: c.day,
                score: c.vascular_age,
              }))}
              dataKey="score"
              title="Cardiovascular Age Trend"
              color="#f43f5e"
              gradientId="cvAgeGrad"
              unit=" years"
            />
          )}
        </div>
      )}
    </DashboardShell>
  );
}
