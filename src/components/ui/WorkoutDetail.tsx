"use client";

import { useMemo, Suspense } from "react";
import { Heart, Zap, TrendingUp, Clock, MapPin, Flame } from "lucide-react";
import { LazyIntradayChart as IntradayChart } from "@/components/charts";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";
import { COLORS } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import type { Workout } from "@/types/oura";

interface WorkoutDetailProps {
  workout: Workout;
}

function intervalToTimeSeries(
  data: { interval: number; items: number[]; timestamp: string } | undefined,
  filterZero = true
): { time: string; value: number }[] {
  if (!data || !data.items?.length) return [];

  const startTime = new Date(data.timestamp).getTime();
  const intervalMs = data.interval * 1000;

  return data.items
    .map((value, i) => ({
      time: new Date(startTime + i * intervalMs).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      value,
    }))
    .filter((d) => !filterZero || d.value > 0);
}

function formatPace(speedMs: number): string {
  if (speedMs <= 0) return "--";
  const paceSecPerKm = 1000 / speedMs;
  const min = Math.floor(paceSecPerKm / 60);
  const sec = Math.round(paceSecPerKm % 60);
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function formatSpeed(speedMs: number): string {
  if (speedMs <= 0) return "--";
  return (speedMs * 3.6).toFixed(1); // m/s to km/h
}

export function WorkoutDetail({ workout }: WorkoutDetailProps) {
  const duration =
    (new Date(workout.end_datetime).getTime() -
      new Date(workout.start_datetime).getTime()) /
    1000;

  const hrData = useMemo(
    () => intervalToTimeSeries(workout.heart_rate),
    [workout.heart_rate]
  );

  const speedData = useMemo(
    () => intervalToTimeSeries(workout.speed),
    [workout.speed]
  );

  // Compute stats from interval data if summary fields are missing
  const hrValues = hrData.map((d) => d.value).filter((v) => v > 0);
  const avgHR =
    workout.average_heart_rate ||
    (hrValues.length > 0
      ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length)
      : null);
  const maxHR =
    workout.max_heart_rate ||
    (hrValues.length > 0 ? Math.max(...hrValues) : null);
  const minHR = hrValues.length > 0 ? Math.min(...hrValues) : null;

  const speedValues = speedData.map((d) => d.value).filter((v) => v > 0);
  const avgSpeed =
    workout.average_speed ||
    (speedValues.length > 0
      ? speedValues.reduce((a, b) => a + b, 0) / speedValues.length
      : null);
  const maxSpeed =
    workout.max_speed ||
    (speedValues.length > 0 ? Math.max(...speedValues) : null);

  const hasDistance = workout.distance > 0;
  const isRunOrCycle =
    workout.activity &&
    /run|cycling|walk|hik|swim|ski|rowing/i.test(workout.activity);

  const hasAnyDetail = hrData.length > 0 || speedData.length > 0 || avgHR || hasDistance;

  if (!hasAnyDetail) {
    return (
      <div className="px-4 pb-4 pt-0">
        <p className="text-xs text-gray-400 italic">
          No detailed data available for this workout.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-5 pt-1 space-y-4 animate-fade-in">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatTile icon={Clock} label="Duration" value={formatDuration(duration)} />
        <StatTile
          icon={Flame}
          label="Calories"
          value={`${Math.round(workout.calories || 0)}`}
          unit="cal"
        />
        {hasDistance && (
          <StatTile
            icon={MapPin}
            label="Distance"
            value={(workout.distance / 1000).toFixed(2)}
            unit="km"
          />
        )}
        {avgHR && (
          <StatTile
            icon={Heart}
            label="Avg HR"
            value={String(avgHR)}
            unit="bpm"
            color={COLORS.heartRate}
          />
        )}
        {maxHR && (
          <StatTile
            icon={TrendingUp}
            label="Max HR"
            value={String(maxHR)}
            unit="bpm"
            color={COLORS.heartRate}
          />
        )}
        {minHR && (
          <StatTile
            icon={Heart}
            label="Min HR"
            value={String(minHR)}
            unit="bpm"
          />
        )}
        {avgSpeed && isRunOrCycle && (
          <StatTile
            icon={Zap}
            label="Avg Pace"
            value={formatPace(avgSpeed)}
            unit="/km"
          />
        )}
        {avgSpeed && (
          <StatTile
            icon={Zap}
            label="Avg Speed"
            value={formatSpeed(avgSpeed)}
            unit="km/h"
          />
        )}
        {maxSpeed && (
          <StatTile
            icon={TrendingUp}
            label="Max Speed"
            value={formatSpeed(maxSpeed)}
            unit="km/h"
          />
        )}
      </div>

      {/* Heart Rate Chart */}
      {hrData.length > 0 && (
        <Suspense fallback={<ChartSkeleton />}>
          <IntradayChart
            data={hrData}
            title="Heart Rate"
            color={COLORS.heartRate}
            unit=" bpm"
            avgValue={avgHR || undefined}
            gradientId={`hr-${workout.id}`}
            height={160}
          />
        </Suspense>
      )}

      {/* Speed Chart */}
      {speedData.length > 0 && (
        <Suspense fallback={<ChartSkeleton />}>
          <IntradayChart
            data={speedData.map((d) => ({
              time: d.time,
              value: Math.round(d.value * 3.6 * 10) / 10, // m/s → km/h
            }))}
            title="Speed"
            color={COLORS.steps}
            unit=" km/h"
            avgValue={avgSpeed ? Math.round(avgSpeed * 3.6 * 10) / 10 : undefined}
            gradientId={`speed-${workout.id}`}
            height={160}
          />
        </Suspense>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
      <Icon
        className="w-3.5 h-3.5 mb-1"
        style={color ? { color } : undefined}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold">
        {value}
        {unit && (
          <span className="text-xs font-normal text-gray-400 ml-0.5">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
