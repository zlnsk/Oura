"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { DateRangeSelector } from "@/components/ui/DateRangeSelector";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { ScoreLineChart } from "@/components/charts/ScoreLineChart";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import {
  LayoutDashboard,
  BedDouble,
  Footprints,
  Heart,
  Flame,
  Brain,
  Wind,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { average, trend, formatDuration } from "@/lib/utils";
import type { DashboardData } from "@/types/oura";

function AISummarySection({ data }: { data: DashboardData }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to generate summary");
      }
      const json = await res.json();
      setSummary(json.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-oura-500 flex items-center justify-center shadow-lg shadow-accent-violet/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Health Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by Claude
            </p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="btn-primary text-sm px-4 py-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : summary ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Analysis
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}
        {loading && !summary && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"
                style={{ width: `${85 - i * 8}%` }}
              />
            ))}
          </div>
        )}
        {summary && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-base prose-headings:font-semibold prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-li:text-slate-600 dark:prose-li:text-slate-300"
            dangerouslySetInnerHTML={{
              __html: summary
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/^### (.*$)/gm, '<h3 class="mt-4 mb-2">$1</h3>')
                .replace(/^## (.*$)/gm, '<h2 class="mt-6 mb-3 text-lg">$1</h2>')
                .replace(/^# (.*$)/gm, '<h1 class="mt-6 mb-3 text-xl">$1</h1>')
                .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal">$2</li>')
                .replace(/\n\n/g, "<br/><br/>")
                .replace(/\n/g, "<br/>"),
            }}
          />
        )}
        {!summary && !loading && !error && (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
            Click &quot;Generate Analysis&quot; to get AI-powered insights about your health data
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, fetchData } = useOuraData();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latestSleep = data?.sleep?.[data.sleep.length - 1];
  const latestActivity = data?.activity?.[data.activity.length - 1];
  const latestReadiness = data?.readiness?.[data.readiness.length - 1];

  const sleepScores = data?.sleep?.map((s) => s.score).filter(Boolean) || [];
  const activityScores = data?.activity?.map((a) => a.score).filter(Boolean) || [];
  const readinessScores = data?.readiness?.map((r) => r.score).filter(Boolean) || [];

  const latestSleepPeriod = data?.sleepPeriods?.[data.sleepPeriods.length - 1];
  const avgSteps = average(data?.activity?.map((a) => a.steps) || []);
  const avgHR = latestSleepPeriod?.average_heart_rate || 0;
  const latestHRV = latestSleepPeriod?.average_hrv || 0;

  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard"
        subtitle="Your health at a glance"
        icon={LayoutDashboard}
        iconColor="#0c93e9"
        action={
          <div className="flex items-center gap-3">
            <DateRangeSelector />
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn-secondary text-sm px-3 py-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      {loading && !data && <LoadingGrid />}

      {!loading && !data && <EmptyState />}
      {error && !data && <EmptyState />}

      {data && (
        <div className="space-y-6 animate-fade-in">
          {/* Score rings */}
          <div className="premium-card p-8">
            <div className="flex flex-wrap items-center justify-center gap-12">
              <ScoreRing
                score={latestSleep?.score || 0}
                size={120}
                label="Sleep"
              />
              <ScoreRing
                score={latestActivity?.score || 0}
                size={120}
                label="Activity"
              />
              <ScoreRing
                score={latestReadiness?.score || 0}
                size={120}
                label="Readiness"
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Sleep"
              value={
                latestSleepPeriod
                  ? formatDuration(latestSleepPeriod.total_sleep_duration)
                  : "--"
              }
              icon={BedDouble}
              color="#6366f1"
              trend={trend(data.sleepPeriods.map((s) => s.total_sleep_duration))}
              trendLabel={`Avg ${formatDuration(average(data.sleepPeriods.map((s) => s.total_sleep_duration)))}`}
              trendPositive={
                trend(data.sleepPeriods.map((s) => s.total_sleep_duration)) === "up"
              }
            />
            <StatCard
              label="Daily Steps"
              value={latestActivity?.steps?.toLocaleString() || "--"}
              icon={Footprints}
              color="#10b981"
              trend={trend(data.activity.map((a) => a.steps))}
              trendLabel={`Avg ${avgSteps.toLocaleString()}`}
              trendPositive={trend(data.activity.map((a) => a.steps)) === "up"}
            />
            <StatCard
              label="Resting HR"
              value={avgHR || "--"}
              unit="bpm"
              icon={Heart}
              color="#f43f5e"
              trend={trend(data.sleepPeriods.map((s) => s.average_heart_rate))}
              trendLabel={`Avg ${average(data.sleepPeriods.map((s) => s.average_heart_rate))} bpm`}
              trendPositive={
                trend(data.sleepPeriods.map((s) => s.average_heart_rate)) === "down"
              }
            />
            <StatCard
              label="HRV"
              value={latestHRV || "--"}
              unit="ms"
              icon={Wind}
              color="#8b5cf6"
              trend={trend(data.sleepPeriods.map((s) => s.average_hrv))}
              trendLabel={`Avg ${average(data.sleepPeriods.map((s) => s.average_hrv))} ms`}
              trendPositive={
                trend(data.sleepPeriods.map((s) => s.average_hrv)) === "up"
              }
            />
          </div>

          {/* Additional quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Calories Burned"
              value={latestActivity?.total_calories?.toLocaleString() || "--"}
              unit="cal"
              icon={Flame}
              color="#f59e0b"
            />
            <StatCard
              label="Avg Sleep Score"
              value={average(sleepScores)}
              icon={BedDouble}
              color="#6366f1"
            />
            <StatCard
              label="Avg Activity Score"
              value={average(activityScores)}
              icon={Footprints}
              color="#10b981"
            />
            <StatCard
              label="Avg Readiness"
              value={average(readinessScores)}
              icon={Brain}
              color="#f43f5e"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScoreLineChart
              data={data.sleep}
              title="Sleep Score Trend"
              color="#6366f1"
              gradientId="sleepGrad"
              domain={[40, 100]}
            />
            <ScoreLineChart
              data={data.readiness}
              title="Readiness Score Trend"
              color="#10b981"
              gradientId="readinessGrad"
              domain={[40, 100]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScoreLineChart
              data={data.activity}
              title="Activity Score Trend"
              color="#f59e0b"
              gradientId="activityGrad"
              domain={[40, 100]}
            />
            <MultiLineChart
              data={data.sleepPeriods.map((s) => ({
                day: s.day,
                hr: s.average_heart_rate,
                hrv: s.average_hrv,
              }))}
              lines={[
                { key: "hr", color: "#f43f5e", name: "Heart Rate" },
                { key: "hrv", color: "#8b5cf6", name: "HRV" },
              ]}
              title="Heart Rate & HRV During Sleep"
            />
          </div>

          {/* AI Summary */}
          <AISummarySection data={data} />
        </div>
      )}
    </DashboardShell>
  );
}
