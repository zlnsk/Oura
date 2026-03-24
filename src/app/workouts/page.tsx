"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOuraData } from "@/components/layout/OuraDataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { DateRangeSelector } from "@/components/ui/DateRangeSelector";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import {
  Dumbbell,
  Flame,
  Clock,
  MapPin,
  Tag,
  RefreshCw,
} from "lucide-react";
import { average, formatDuration } from "@/lib/utils";
import { AISummaryCard } from "@/components/ui/AISummaryCard";
import type { Workout } from "@/types/oura";

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function workoutDuration(w: Workout): number {
  return (new Date(w.end_datetime).getTime() - new Date(w.start_datetime).getTime()) / 1000;
}

export default function WorkoutsPage() {
  const { data, loading, fetchData } = useOuraData();
  const [selectedDate, setSelectedDate] = useState(getToday());

  useEffect(() => {
    if (!data) fetchData();
  }, [data, fetchData]);

  const allWorkouts = data?.workouts || [];
  const sessions = data?.sessions || [];
  const tags = data?.tags || [];

  // Workouts for the selected day
  const dayWorkouts = useMemo(
    () => allWorkouts.filter((w) => w.day === selectedDate),
    [allWorkouts, selectedDate]
  );
  const daySessions = useMemo(
    () => sessions.filter((s) => s.day === selectedDate),
    [sessions, selectedDate]
  );
  const dayTags = useMemo(
    () => tags.filter((t) => t.day === selectedDate),
    [tags, selectedDate]
  );

  // Day stats
  const dayCalories = dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const dayDistance = dayWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
  const dayDurations = dayWorkouts.map(workoutDuration);
  const dayTotalDuration = dayDurations.reduce((a, b) => a + b, 0);

  // Period stats (for trends section)
  const periodCalories = allWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const periodAvgDuration = average(allWorkouts.map(workoutDuration));

  // Calories per day for chart
  const caloriesByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of allWorkouts) {
      map.set(w.day, (map.get(w.day) || 0) + (w.calories || 0));
    }
    return Array.from(map.entries())
      .map(([day, calories]) => ({ day, calories: Math.round(calories) }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [allWorkouts]);

  return (
    <DashboardShell>
      <PageHeader
        title="Workouts & Sessions"
        subtitle="Exercise tracking and tags"
        icon={Dumbbell}
        iconColor="#f43f5e"
        action={
          <div className="flex items-center gap-3">
            <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <button onClick={fetchData} disabled={loading} className="btn-secondary text-sm px-3 py-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      {loading && !data && <LoadingGrid />}
      {!loading && !data && <EmptyState />}

      {data && (
        <div className="space-y-6 animate-fade-in">
          <AISummaryCard page="workouts" data={data} />

          {/* Day stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Workouts Today"
              value={dayWorkouts.length}
              icon={Dumbbell}
              color="#f43f5e"
            />
            <StatCard
              label="Calories Burned"
              value={Math.round(dayCalories).toLocaleString()}
              unit="cal"
              icon={Flame}
              color="#f59e0b"
            />
            <StatCard
              label="Total Duration"
              value={dayWorkouts.length > 0 ? formatDuration(dayTotalDuration) : "—"}
              icon={Clock}
              color="#06b6d4"
            />
            <StatCard
              label="Distance"
              value={dayWorkouts.length > 0 ? (dayDistance / 1000).toFixed(1) : "—"}
              unit={dayWorkouts.length > 0 ? "km" : ""}
              icon={MapPin}
              color="#10b981"
            />
          </div>

          {/* Day workouts list */}
          <div className="premium-card overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/40">
              <h3 className="font-semibold">
                Workouts on {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </h3>
            </div>
            <div className="divide-y divide-slate-200/60 dark:divide-slate-800/40">
              {dayWorkouts.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No workouts on this day
                </div>
              ) : (
                dayWorkouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {w.activity?.replace(/_/g, " ") || "Workout"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(w.start_datetime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            {" — "}
                            {new Date(w.end_datetime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="font-semibold">{Math.round(w.calories || 0)} cal</p>
                          <p className="text-xs text-slate-400">
                            {formatDuration(workoutDuration(w))}
                          </p>
                        </div>
                        <span
                          className={`badge ${
                            w.intensity === "high"
                              ? "badge-danger"
                              : w.intensity === "medium"
                              ? "badge-warning"
                              : "badge-success"
                          }`}
                        >
                          {w.intensity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Day sessions */}
          {daySessions.length > 0 && (
            <div className="premium-card overflow-hidden">
              <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/40">
                <h3 className="font-semibold">Sessions (Meditation/Breathing)</h3>
              </div>
              <div className="divide-y divide-slate-200/60 dark:divide-slate-800/40">
                {daySessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">
                          {s.type?.replace(/_/g, " ") || "Session"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(s.start_datetime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-semibold">
                        {formatDuration(
                          (new Date(s.end_datetime).getTime() -
                            new Date(s.start_datetime).getTime()) /
                            1000
                        )}
                      </p>
                      {s.mood && (
                        <span className="badge badge-success mt-1">{s.mood}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day tags */}
          {dayTags.length > 0 && (
            <div className="premium-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {dayTags.map((t) => (
                  <div
                    key={t.id}
                    className="badge bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  >
                    <Tag className="w-3 h-3" />
                    {t.text || t.tag_type_code}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trends</h3>
            <DateRangeSelector />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Period Workouts"
              value={allWorkouts.length}
              icon={Dumbbell}
              color="#f43f5e"
            />
            <StatCard
              label="Period Calories"
              value={Math.round(periodCalories).toLocaleString()}
              unit="cal"
              icon={Flame}
              color="#f59e0b"
            />
            <StatCard
              label="Avg Duration"
              value={allWorkouts.length > 0 ? formatDuration(periodAvgDuration) : "—"}
              icon={Clock}
              color="#06b6d4"
            />
            <StatCard
              label="Total Distance"
              value={allWorkouts.length > 0 ? (allWorkouts.reduce((s, w) => s + (w.distance || 0), 0) / 1000).toFixed(1) : "—"}
              unit={allWorkouts.length > 0 ? "km" : ""}
              icon={MapPin}
              color="#10b981"
            />
          </div>

          {/* Calories chart */}
          {caloriesByDay.length > 0 && (
            <BarChartComponent
              data={caloriesByDay}
              dataKey="calories"
              title="Workout Calories"
              color="#f59e0b"
              unit=" cal"
            />
          )}
        </div>
      )}
    </DashboardShell>
  );
}
