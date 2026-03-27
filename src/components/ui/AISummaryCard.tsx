"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Zap } from "lucide-react";
import type { DashboardData } from "@/types/oura";
import { BASE_PATH } from "@/lib/constants";

export type PageType = "dashboard" | "sleep" | "activity" | "readiness" | "heart-rate" | "stress" | "workouts" | "weight";

interface AISummary {
  overall: string;
  tip: string;
}

export function AISummaryCard({ page, data }: { page: PageType; data: DashboardData }) {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_PATH}/api/ai-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, page }),
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
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Insight</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Powered by Claude</p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
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
                <div key={i} className="h-3 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" style={{ width: `${90 - i * 15}%` }} />
              ))}
            </div>
          )}
          {summary && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {summary.overall}
              </p>
              {summary.tip && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border-l-2 border-oura-400">
                  <Zap className="w-3.5 h-3.5 text-oura-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{summary.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
