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
import { average, trend, formatDuration } from "@/lib/utils";
import type { DashboardData, SleepPeriod, DailySleep, DailyActivity, DailyReadiness } from "@/types/oura";

function getDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getToday(): string {
  return getDateStr(new Date());
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateStr(d);
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
  aiSummary,
}: {
  todaySleep: DailySleep | undefined;
  todaySleepPeriod: SleepPeriod | undefined;
  todayActivity: DailyActivity | undefined;
  todayReadiness: DailyReadiness | undefined;
  aiSummary: AISummary | null;
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Determine if we're showing today's data or the latest available
  const dataDay = todaySleep?.day || todayActivity?.day || todayReadiness?.day;
  const today = getToday();
  const isToday = dataDay === today;

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
          No data available yet. Your progress will appear here once Oura syncs.
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
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dateStr}
                {!isToday && dataDay && (
                  <span className="ml-2 text-amber-500">
                    &middot; Showing data from {new Date(dataDay + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </p>
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

            <AIInsightBadge text={aiSummary?.sleep || ""} />
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
              <AIInsightBadge text={aiSummary?.readiness || ""} />
            </div>
          )}

          {/* Activity */}
          {hasActivity && (
            <div className="premium-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Yesterday&apos;s Activity
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
              <AIInsightBadge text={aiSummary?.activity || ""} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AISummary {
  overall: string;
  sleep: string;
  activity: string;
  readiness: string;
  tip: string;
}

function AIInsightBadge({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-100 dark:border-violet-900/30">
      <Sparkles className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

function AISummarySection({ data, aiSummary, onFetch, loading, error }: {
  data: DashboardData;
  aiSummary: AISummary | null;
  onFetch: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-violet to-oura-500 flex items-center justify-center shadow-lg shadow-accent-violet/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Health Summary</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Powered by Claude</p>
          </div>
        </div>
        <button
          onClick={onFetch}
          disabled={loading}
          className="btn-primary text-xs px-3 py-1.5"
        >
          {loading ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
          ) : aiSummary ? (
            <><RefreshCw className="w-3.5 h-3.5" /> Refresh</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> Generate</>
          )}
        </button>
      </div>

      {(error || loading || aiSummary) && (
        <div className="px-5 pb-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}
          {loading && !aiSummary && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" style={{ width: `${90 - i * 15}%` }} />
              ))}
            </div>
          )}
          {aiSummary && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiSummary.overall}
              </p>
              {aiSummary.tip && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                  <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{aiSummary.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, fetchData, lastUpdated } = useOuraData();
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiSummary = async () => {
    if (!data) return;
    setAiLoading(true);
    setAiError(null);
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
      setAiSummary(json.summary);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const today = getToday();
  const yesterday = getYesterday();
  // Sleep/readiness: check today first, then yesterday (last night's data)
  const todaySleep = data?.sleep?.find((s) => s.day === today) || data?.sleep?.find((s) => s.day === yesterday);
  // Only use long_sleep periods (skip naps/rest)
  const todaySleepPeriod = data?.sleepPeriods?.find((s) => s.day === today && s.type === "long_sleep") || data?.sleepPeriods?.find((s) => s.day === yesterday && s.type === "long_sleep");
  const todayReadiness = data?.readiness?.find((r) => r.day === today) || data?.readiness?.find((r) => r.day === yesterday);
  // Activity: Oura API pre-populates today with stale projected values.
  // Use yesterday's completed data which is accurate.
  const todayActivity = data?.activity?.find((a) => a.day === yesterday);

  const sleepScores = data?.sleep?.map((s) => s.score).filter(Boolean) || [];
  const avgSteps = average(data?.activity?.map((a) => a.steps) || []);

  return (
    <DashboardShell>
      <PageHeader
        title="Today"
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        icon={LayoutDashboard}
        iconColor="#0c93e9"
        action={
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
                Updated {new Date(lastUpdated).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn-secondary text-sm px-3 py-2"
              title="Refresh data from Oura"
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
            aiSummary={aiSummary}
          />

          {/* AI Summary */}
          <AISummarySection
            data={data}
            aiSummary={aiSummary}
            onFetch={fetchAiSummary}
            loading={aiLoading}
            error={aiError}
          />

          {/* Trends section */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trends</h2>
            <DateRangeSelector />
          </div>

          {/* Period averages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Avg Sleep Score"
              value={average(sleepScores)}
              icon={BedDouble}
              color="#6366f1"
              trend={trend(data.sleep.map((s) => s.score))}
              trendLabel={`Today ${todaySleep?.score || "--"}`}
              trendPositive={trend(data.sleep.map((s) => s.score)) === "up"}
            />
            <StatCard
              label="Avg Steps"
              value={avgSteps.toLocaleString()}
              icon={Footprints}
              color="#10b981"
              trend={trend(data.activity.map((a) => a.steps))}
              trendLabel={`Yesterday ${todayActivity?.steps?.toLocaleString() || "--"}`}
              trendPositive={trend(data.activity.map((a) => a.steps)) === "up"}
            />
            <StatCard
              label="Avg Resting HR"
              value={average(data.sleepPeriods.filter((s) => s.type === "long_sleep").map((s) => s.average_heart_rate)) || "--"}
              unit="bpm"
              icon={Heart}
              color="#f43f5e"
              trend={trend(data.sleepPeriods.filter((s) => s.type === "long_sleep").map((s) => s.average_heart_rate))}
              trendLabel={`Last night ${todaySleepPeriod?.average_heart_rate || "--"}`}
              trendPositive={trend(data.sleepPeriods.filter((s) => s.type === "long_sleep").map((s) => s.average_heart_rate)) === "down"}
            />
            <StatCard
              label="Avg HRV"
              value={average(data.sleepPeriods.filter((s) => s.type === "long_sleep").map((s) => s.average_hrv)) || "--"}
              unit="ms"
              icon={Wind}
              color="#8b5cf6"
              trend={trend(data.sleepPeriods.filter((s) => s.type === "long_sleep").map((s) => s.average_hrv))}
              trendLabel={`Last night ${todaySleepPeriod?.average_hrv || "--"}`}
              trendPositive={trend(data.sleepPeriods.filter((s) => s.type === "long_sleep").map((s) => s.average_hrv)) === "up"}
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

        </div>
      )}
    </DashboardShell>
  );
}
