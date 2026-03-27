"use client";

import { useState, useEffect } from "react";
import { BASE_PATH } from "@/lib/constants";

interface BuildEntry {
  number: number;
  date: string;
  description: string;
}

interface BuildInfo {
  buildNumber: number;
  buildDate: string;
  version: string;
  builds: BuildEntry[];
}

export function StatusBar({ collapsed }: { collapsed?: boolean }) {
  const [info, setInfo] = useState<BuildInfo | null>(null);

  useEffect(() => {
    fetch(`${BASE_PATH}/buildInfo.json`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  if (!info) return null;

  const today = new Date().toISOString().slice(0, 10);
  const buildsToday = info.builds.filter((b) => b.date === today).length;
  const lastBuild = info.builds[0];

  if (collapsed) {
    return (
      <div className="px-2 py-2 text-center" title={`v${info.version} · Build #${info.buildNumber} · ${buildsToday} today`}>
        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600">
          v{info.version}
        </span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
          v{info.version}
        </span>
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
          Build #{info.buildNumber}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {buildsToday} build{buildsToday !== 1 ? "s" : ""} today
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {lastBuild ? new Date(lastBuild.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
        </span>
      </div>
      {lastBuild && (
        <p className="text-[9px] text-slate-400/70 dark:text-slate-600 truncate" title={lastBuild.description}>
          {lastBuild.description}
        </p>
      )}
    </div>
  );
}
