"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { DashboardData } from "@/types/oura";

const CACHE_KEY = "oura_data_cache";
const STALE_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  data: DashboardData;
  days: number;
  timestamp: number;
}

function readCacheEntry(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

function readCache(days: number): DashboardData | null {
  const entry = readCacheEntry();
  if (!entry || entry.days !== days) return null;
  return entry.data;
}

function writeCache(data: DashboardData, days: number) {
  try {
    const entry: CacheEntry = { data, days, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // storage full or unavailable — ignore
  }
}

function isCacheStale(days: number): boolean {
  const entry = readCacheEntry();
  if (!entry || entry.days !== days) return true;
  return Date.now() - entry.timestamp > STALE_MS;
}

interface OuraDataContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;
  fetchData: () => Promise<void>;
  lastUpdated: number | null;
}

const defaultData: DashboardData = {
  sleep: [],
  sleepPeriods: [],
  activity: [],
  readiness: [],
  heartRate: [],
  stress: [],
  spo2: [],
  resilience: [],
  cardiovascularAge: [],
  workouts: [],
  sessions: [],
  vo2Max: [],
  sleepTime: [],
  tags: [],
  personalInfo: null,
};

const OuraDataContext = createContext<OuraDataContextType>({
  data: null,
  loading: false,
  error: null,
  days: 30,
  setDays: () => {},
  fetchData: async () => {},
  lastUpdated: null,
});

export function OuraDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const hydratedRef = useRef(false);

  // Load cached data on mount
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const entry = readCacheEntry();
    if (entry && entry.days === days) {
      setData({ ...defaultData, ...entry.data });
      setLastUpdated(entry.timestamp);
    }
  }, [days]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/oura/all?days=${days}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to fetch data");
      }
      const json = await res.json();
      const merged = { ...defaultData, ...json };
      setData(merged);
      writeCache(merged, days);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  // Re-fetch when days changes
  const prevDaysRef = useRef(days);
  useEffect(() => {
    if (prevDaysRef.current !== days) {
      prevDaysRef.current = days;
      fetchData();
    }
  }, [days, fetchData]);

  return (
    <OuraDataContext.Provider
      value={{ data, loading, error, days, setDays, fetchData, lastUpdated }}
    >
      {children}
    </OuraDataContext.Provider>
  );
}

export const useOuraData = () => useContext(OuraDataContext);
