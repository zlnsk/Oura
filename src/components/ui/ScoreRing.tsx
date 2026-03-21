"use client";

import { cn, getScoreLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function ScoreRing({
  score,
  size = 96,
  strokeWidth = 8,
  label,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return { stroke: "#10b981", glow: "rgba(16,185,129,0.3)" };
    if (s >= 70) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.3)" };
    return { stroke: "#f43f5e", glow: "rgba(244,63,94,0.3)" };
  };

  const color = getColor(score);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(0 0 8px ${color.glow})` }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight">{score}</span>
        </div>
      </div>
      {label && (
        <div className="mt-2 text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
            style={{ color: color.stroke }}
          >
            {getScoreLabel(score)}
          </p>
        </div>
      )}
    </div>
  );
}
