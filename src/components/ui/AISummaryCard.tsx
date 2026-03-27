"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Zap } from "lucide-react";
import type { DashboardData } from "@/types/oura";
import { BASE_PATH } from "@/lib/constants";
import type { PageType } from "@/lib/constants";
export type { PageType };

interface AISummary {
  overall: string;
  tip: string;
}

/**
 * Trim DashboardData to only include fields relevant to each page's AI prompt,
 * preventing "Request body too large" errors from sending unused bulk data.
 */
function trimDataForPage(data: DashboardData, page: PageType): Partial<DashboardData> {
  switch (page) {
    case "sleep":
      return { sleep: data.sleep, sleepPeriods: data.sleepPeriods };
    case "activity":
      return { activity: data.activity, workouts: data.workouts };
    case "readiness":
      return { readiness: data.readiness, sleepPeriods: data.sleepPeriods };
    case "heart-rate":
      return { sleepPeriods: data.sleepPeriods };
    case "stress":
      return { stress: data.stress, spo2: data.spo2, cardiovascularAge: data.cardiovascularAge };
    case "workouts":
      return { workouts: data.workouts, activity: data.activity };
    case "weight":
      return { weight: data.weight, activity: data.activity };
    default:
      // Dashboard overview – send scores + recent sleep/activity/readiness/stress
      return {
        sleep: data.sleep,
        activity: data.activity,
        readiness: data.readiness,
        stress: data.stress,
        sleepPeriods: data.sleepPeriods,
      };
  }
}

export function AISummaryCard({ page, data }: { page: PageType; data: DashboardData }) {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const trimmed = trimDataForPage(data, page);
      const res = await fetch(`${BASE_PATH}/api/ai-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: trimmed, page }),
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
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Insight</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Powered by Claude</p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--border)] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
          ) : summary ? (
            <><RefreshCw className="w-3.5 h-3.5" /> Refresh</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> Generate</>
          )}
        </button>
      </div>

      {(error || loading || summary) && (
        <div className="px-5 pb-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}
          {loading && !summary && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" style={{ width: `${90 - i * 15}%` }} />
              ))}
            </div>
          )}
          {summary && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {summary.overall}
              </p>
              {summary.tip && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border-l-2 border-oura-400">
                  <Zap className="w-3.5 h-3.5 text-oura-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{summary.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
