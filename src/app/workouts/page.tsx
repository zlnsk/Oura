"use client";

import { useEffect, useState } from "react";
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

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WorkoutsPage() {
  const { data, loading, fetchData } = useOuraData();
  const [selectedDate, setSelectedDate] = useState(getToday());

  useEffect(() => {
    if (!data) fetchData();
  }, [data, fetchData]);

  const workouts = data?.workouts || [];
  const sessions = data?.sessions || [];
  const tags = data?.tags || [];

  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);

  // Workout durations
  const workoutDurations = workouts.map((w) => {
    const start = new Date(w.start_datetime).getTime();
    const end = new Date(w.end_datetime).getTime();
    return (end - start) / 1000;
  });
  const avgDuration = average(workoutDurations);

  // Calories per workout
  const caloriesByDay = workouts.map((w) => ({
    day: w.day,
    calories: w.calories || 0,
  }));

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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Workouts"
              value={workouts.length}
              icon={Dumbbell}
              color="#f43f5e"
            />
            <StatCard
              label="Total Calories"
              value={totalCalories.toLocaleString()}
              unit="cal"
              icon={Flame}
              color="#f59e0b"
            />
            <StatCard
              label="Avg Duration"
              value={formatDuration(avgDuration)}
              icon={Clock}
              color="#06b6d4"
            />
            <StatCard
              label="Total Distance"
              value={(totalDistance / 1000).toFixed(1)}
              unit="km"
              icon={MapPin}
              color="#10b981"
            />
          </div>

          {/* Trends */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Trends</h3>
            <DateRangeSelector />
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

          {/* Workout list */}
          <div className="premium-card overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/40">
              <h3 className="font-semibold">Recent Workouts</h3>
            </div>
            <div className="divide-y divide-slate-200/60 dark:divide-slate-800/40">
              {workouts.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No workouts recorded in this period
                </div>
              ) : (
                workouts.slice(-20).reverse().map((w) => (
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
                          <p className="text-xs text-slate-400">{w.day}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="font-semibold">{w.calories || 0} cal</p>
                          <p className="text-xs text-slate-400">
                            {formatDuration(
                              (new Date(w.end_datetime).getTime() -
                                new Date(w.start_datetime).getTime()) /
                                1000
                            )}
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

          {/* Sessions */}
          {sessions.length > 0 && (
            <div className="premium-card overflow-hidden">
              <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/40">
                <h3 className="font-semibold">Sessions (Meditation/Breathing)</h3>
              </div>
              <div className="divide-y divide-slate-200/60 dark:divide-slate-800/40">
                {sessions.slice(-10).reverse().map((s) => (
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
                        <p className="text-xs text-slate-400">{s.day}</p>
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

          {/* Tags */}
          {tags.length > 0 && (
            <div className="premium-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <div
                    key={t.id}
                    className="badge bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  >
                    <Tag className="w-3 h-3" />
                    {t.text || t.tag_type_code}
                    <span className="text-slate-400 ml-1">{t.day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
