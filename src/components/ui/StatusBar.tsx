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

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
  const firstBuild = info.builds[info.builds.length - 1];
  const latestBuild = info.builds[0];

  if (collapsed) {
    return (
      <div className="px-2 py-2 text-center" title={`v${info.version} · Build #${info.buildNumber} · ${buildsToday} today`}>
        <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600">
          v{info.version}
        </span>
      </div>
    );
  }

  return (
    <div className="px-4 py-2.5 flex items-center gap-2 text-[10px] font-mono text-gray-400 dark:text-gray-500 flex-wrap">
      <span className="text-oura-500 dark:text-oura-400 font-semibold">v{info.version}</span>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <span>Build #{info.buildNumber}</span>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <span>Today: <span className="font-semibold text-gray-500 dark:text-gray-400">{buildsToday}</span></span>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <span>First: {firstBuild ? formatDateTime(firstBuild.date) : "—"}</span>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <span>Latest: {latestBuild ? formatDateTime(latestBuild.date) : "—"}</span>
    </div>
  );
}
