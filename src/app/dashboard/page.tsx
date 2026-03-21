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
  Moon,
  Sun,
  Clock,
  Zap,
  Activity,
  Target,
} from "lucide-react";
import { average, trend, formatDuration, getScoreColor, getScoreLabel } from "@/lib/utils";
import type { DashboardData, SleepPeriod, DailySleep, DailyActivity, DailyReadiness } from "@/types/oura";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function SleepStageBar({
  label,
  minutes,
  totalMinutes,
  color,
}: {
  label: string;
  minutes: number;
  totalMinutes: number;
  color: string;
}) {
  const pct = totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium tabular-nums">
          {Math.floor(minutes / 60)}h {minutes % 60}m
          <span className="text-slate-400 dark:text-slate-500 ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ContributorBar({ label, value }: { label: string; value: number }) {
  const getBarColor = (v: number) => {
    if (v >= 85) return "#10b981";
    if (v >= 70) return "#f59e0b";
    return "#f43f5e";
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: getBarColor(value) }}
        />
      </div>
    </div>
  );
}

function TodayProgress({
  todaySleep,
  todaySleepPeriod,
  todayActivity,
  todayReadiness,
}: {
  todaySleep: DailySleep | undefined;
  todaySleepPeriod: SleepPeriod | undefined;
  todayActivity: DailyActivity | undefined;
  todayReadiness: DailyReadiness | undefined;
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = today.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const hasSleep = todaySleepPeriod && todaySleepPeriod.total_sleep_duration > 0;
  const hasActivity = todayActivity && todayActivity.score > 0;
  const hasReadiness = todayReadiness && todayReadiness.score > 0;

  if (!hasSleep && !hasActivity && !hasReadiness) {
    return (
      <div className="premium-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{greeting}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{dateStr}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          No data for today yet. Your progress will appear here once Oura syncs.
        </p>
      </div>
    );
  }

  // Sleep stage breakdown in minutes
  const deepMin = hasSleep ? Math.round(todaySleepPeriod.deep_sleep_duration / 60) : 0;
  const remMin = hasSleep ? Math.round(todaySleepPeriod.rem_sleep_duration / 60) : 0;
  const lightMin = hasSleep ? Math.round(todaySleepPeriod.light_sleep_duration / 60) : 0;
  const awakeMin = hasSleep ? Math.round(todaySleepPeriod.awake_time / 60) : 0;
  const totalMin = deepMin + remMin + lightMin + awakeMin;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{greeting}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{dateStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {todaySleep && (
              <ScoreRing score={todaySleep.score} size={64} label="Sleep" />
            )}
            {hasActivity && (
              <ScoreRing score={todayActivity.score} size={64} label="Activity" />
            )}
            {hasReadiness && (
              <ScoreRing score={todayReadiness.score} size={64} label="Readiness" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Last Night's Sleep */}
        {hasSleep && (
          <div className="premium-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Last Night&apos;s Sleep
              </h3>
            </div>

            {/* Bedtime / Wake time row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <Clock className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Bedtime</p>
                <p className="text-sm font-semibold mt-0.5">
                  {formatTime(todaySleepPeriod.bedtime_start)}
                </p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <Sun className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Wake up</p>
                <p className="text-sm font-semibold mt-0.5">
                  {formatTime(todaySleepPeriod.bedtime_end)}
                </p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                <BedDouble className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                <p className="text-sm font-semibold mt-0.5">
                  {formatDuration(todaySleepPeriod.total_sleep_duration)}
                </p>
              </div>
            </div>

            {/* Sleep stages */}
            <div className="space-y-2.5">
              <SleepStageBar label="Deep" minutes={deepMin} totalMinutes={totalMin} color="#6366f1" />
              <SleepStageBar label="REM" minutes={remMin} totalMinutes={totalMin} color="#8b5cf6" />
              <SleepStageBar label="Light" minutes={lightMin} totalMinutes={totalMin} color="#a78bfa" />
              <SleepStageBar label="Awake" minutes={awakeMin} totalMinutes={totalMin} color="#f43f5e" />
            </div>

            {/* Sleep vitals */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Efficiency</p>
                <p className="text-sm font-bold mt-0.5">{todaySleepPeriod.efficiency}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Avg HR</p>
                <p className="text-sm font-bold mt-0.5">
                  {todaySleepPeriod.average_heart_rate} <span className="text-xs font-normal text-slate-400">bpm</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">HRV</p>
                <p className="text-sm font-bold mt-0.5">
                  {todaySleepPeriod.average_hrv} <span className="text-xs font-normal text-slate-400">ms</span>
                </p>
              </div>
            </div>

            {/* Sleep score contributors */}
            {todaySleep && todaySleep.contributors && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Score Contributors</p>
                <div className="space-y-2">
                  <ContributorBar label="Deep sleep" value={todaySleep.contributors.deep_sleep} />
                  <ContributorBar label="REM sleep" value={todaySleep.contributors.rem_sleep} />
                  <ContributorBar label="Efficiency" value={todaySleep.contributors.efficiency} />
                  <ContributorBar label="Restfulness" value={todaySleep.contributors.restfulness} />
                  <ContributorBar label="Timing" value={todaySleep.contributors.timing} />
                  <ContributorBar label="Latency" value={todaySleep.contributors.latency} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Today's Readiness & Activity */}
        <div className="space-y-4">
          {/* Readiness */}
          {hasReadiness && (
            <div className="premium-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Today&apos;s Readiness
                </h3>
              </div>
              <div className="space-y-2">
                <ContributorBar label="HRV Balance" value={todayReadiness.contributors.hrv_balance} />
                <ContributorBar label="Resting HR" value={todayReadiness.contributors.resting_heart_rate} />
                <ContributorBar label="Body Temperature" value={todayReadiness.contributors.body_temperature} />
                <ContributorBar label="Recovery Index" value={todayReadiness.contributors.recovery_index} />
                <ContributorBar label="Sleep Balance" value={todayReadiness.contributors.sleep_balance} />
                <ContributorBar label="Previous Night" value={todayReadiness.contributors.previous_night} />
                <ContributorBar label="Activity Balance" value={todayReadiness.contributors.activity_balance} />
              </div>
            </div>
          )}

          {/* Activity */}
          {hasActivity && (
            <div className="premium-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Today&apos;s Activity
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Footprints className="w-3.5 h-3.5 text-emerald-500 mb-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Steps</p>
                  <p className="text-sm font-bold">{todayActivity.steps.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Flame className="w-3.5 h-3.5 text-orange-500 mb-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Calories</p>
                  <p className="text-sm font-bold">{todayActivity.total_calories.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Target className="w-3.5 h-3.5 text-blue-500 mb-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Calories</p>
                  <p className="text-sm font-bold">{todayActivity.active_calories.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Clock className="w-3.5 h-3.5 text-violet-500 mb-1" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Time</p>
                  <p className="text-sm font-bold">
                    {formatDuration(todayActivity.high_activity_time + todayActivity.medium_activity_time + todayActivity.low_activity_time)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <ContributorBar label="Stay Active" value={todayActivity.contributors.stay_active} />
                <ContributorBar label="Move Every Hour" value={todayActivity.contributors.move_every_hour} />
                <ContributorBar label="Daily Targets" value={todayActivity.contributors.meet_daily_targets} />
                <ContributorBar label="Training Frequency" value={todayActivity.contributors.training_frequency} />
                <ContributorBar label="Training Volume" value={todayActivity.contributors.training_volume} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const today = getToday();
  const todaySleep = data?.sleep?.find((s) => s.day === today);
  const todaySleepPeriod = data?.sleepPeriods?.find((s) => s.day === today);
  const todayActivity = data?.activity?.find((a) => a.day === today);
  const todayReadiness = data?.readiness?.find((r) => r.day === today);

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
          {/* Today's Progress */}
          <TodayProgress
            todaySleep={todaySleep}
            todaySleepPeriod={todaySleepPeriod}
            todayActivity={todayActivity}
            todayReadiness={todayReadiness}
          />

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
