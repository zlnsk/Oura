"use client";

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="premium-card p-6">
      <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4" />
      <div
        className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse"
        style={{ height }}
      />
    </div>
  );
}
