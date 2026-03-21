"use client";

import { useOuraData } from "@/components/layout/OuraDataProvider";
import { cn } from "@/lib/utils";

const ranges = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

export function DateRangeSelector() {
  const { days, setDays, fetchData, loading } = useOuraData();

  const handleChange = (d: number) => {
    setDays(d);
    setTimeout(() => fetchData(), 0);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
      {ranges.map(({ label, days: d }) => (
        <button
          key={d}
          onClick={() => handleChange(d)}
          disabled={loading}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
            days === d
              ? "bg-white dark:bg-oura-600 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
