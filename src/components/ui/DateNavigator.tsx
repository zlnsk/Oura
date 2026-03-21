"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Granularity = "day" | "week" | "month" | "year";

interface DateNavigatorProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

const granularities: { label: string; value: Granularity }[] = [
  { label: "D", value: "day" },
  { label: "W", value: "week" },
  { label: "M", value: "month" },
  { label: "Y", value: "year" },
];

function shiftDate(dateStr: string, granularity: Granularity, direction: -1 | 1): string {
  const d = new Date(dateStr + "T12:00:00"); // noon to avoid DST issues
  switch (granularity) {
    case "day":
      d.setDate(d.getDate() + direction);
      break;
    case "week":
      d.setDate(d.getDate() + 7 * direction);
      break;
    case "month":
      d.setMonth(d.getMonth() + direction);
      break;
    case "year":
      d.setFullYear(d.getFullYear() + direction);
      break;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (dateStr === todayStr) return "Today";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  if (dateStr === yesterdayStr) return "Yesterday";

  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const [granularity, setGranularity] = useState<Granularity>("day");

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const isToday = selectedDate === todayStr;

  return (
    <div className="flex items-center gap-2">
      {/* Prev/Next arrows with date */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
        <button
          onClick={() => onDateChange(shiftDate(selectedDate, granularity, -1))}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all"
          title={`Previous ${granularity}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => isToday ? null : onDateChange(todayStr)}
          className={cn(
            "px-3 py-1 text-xs font-semibold rounded-lg min-w-[100px] text-center transition-all",
            isToday
              ? "text-slate-900 dark:text-white"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          )}
          title="Click to go to today"
        >
          {formatDisplayDate(selectedDate)}
        </button>
        <button
          onClick={() => onDateChange(shiftDate(selectedDate, granularity, 1))}
          disabled={isToday}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            isToday
              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/10"
          )}
          title={`Next ${granularity}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Granularity selector */}
      <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
        {granularities.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setGranularity(value)}
            className={cn(
              "px-2 py-1 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase",
              granularity === value
                ? "bg-white dark:bg-oura-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
