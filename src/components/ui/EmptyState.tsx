"use client";

import { useOuraData } from "@/components/layout/OuraDataProvider";
import { Settings, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  const { error, loading, fetchData } = useOuraData();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6">
        {error ? (
          <AlertCircle className="w-8 h-8 text-rose-500" />
        ) : (
          <Settings className="w-8 h-8 text-slate-400" />
        )}
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {error ? "Connection Error" : "No Data Available"}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
        {error
          ? error
          : "Configure your Oura API key in Settings to start viewing your health data."}
      </p>
      <div className="flex gap-3">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
        >
          <Settings className="w-4 h-4" />
          Go to Settings
        </Link>
        {error && (
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
