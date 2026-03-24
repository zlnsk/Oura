"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Zap } from "lucide-react";
import type { DashboardData } from "@/types/oura";

export type PageType = "dashboard" | "sleep" | "activity" | "readiness" | "heart-rate" | "stress" | "workouts";

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
      const res = await fetch("/api/ai-summary", {
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-violet to-oura-500 flex items-center justify-center shadow-lg shadow-accent-violet/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Insight</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Powered by Claude</p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="btn-primary text-xs px-3 py-1.5"
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
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}
          {loading && !summary && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" style={{ width: `${90 - i * 15}%` }} />
              ))}
            </div>
          )}
          {summary && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {summary.overall}
              </p>
              {summary.tip && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                  <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{summary.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
