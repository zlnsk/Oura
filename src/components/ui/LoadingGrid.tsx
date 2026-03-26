"use client";

export function LoadingGrid() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="premium-card p-5">
            <div className="h-3 w-20 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-slate-100 dark:bg-white/5 rounded-lg mt-3 animate-pulse" />
            <div className="h-2 w-24 bg-slate-100 dark:bg-white/5 rounded-lg mt-3 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="premium-card p-6 h-64">
            <div className="h-4 w-32 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
            <div className="h-full mt-4 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
