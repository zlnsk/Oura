"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { DashboardData } from "@/types/oura";
import { BASE_PATH, CACHE_KEY, STALE_MS } from "@/lib/constants";

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

function writeCache(data: DashboardData, days: number) {
  try {
    const entry: CacheEntry = { data, days, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // storage full or unavailable — ignore
  }
}


interface OuraDataContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;
  fetchData: () => Promise<void>;
  lastUpdated: number | null;
  isOffline: boolean;
  isStale: boolean;
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
  weight: [],
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
  isOffline: false,
  isStale: false,
});

export function OuraDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const hydratedRef = useRef(false);

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Load cached data on mount
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const entry = readCacheEntry();
    if (entry && entry.days === days) {
      setData({ ...defaultData, ...entry.data });
      setLastUpdated(entry.timestamp);
      setIsStale(Date.now() - entry.timestamp > STALE_MS);
    }
  }, [days]);

  const dataRef = useRef(data);
  dataRef.current = data;

  const fetchData = useCallback(async () => {
    // If offline, serve from cache and mark stale
    if (!navigator.onLine) {
      const entry = readCacheEntry();
      if (entry) {
        setData({ ...defaultData, ...entry.data });
        setLastUpdated(entry.timestamp);
        setIsStale(true);
      }
      setError("You are offline. Showing cached data.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch Oura and Withings data in parallel
      const [ouraRes, withingsRes] = await Promise.all([
        fetch(`${BASE_PATH}/api/oura/all?days=${days}`),
        fetch(`${BASE_PATH}/api/withings?days=${days}`).catch(() => null),
      ]);

      if (!ouraRes.ok) {
        const json = await ouraRes.json();
        throw new Error(json.error || "Failed to fetch data");
      }
      const json = await ouraRes.json();

      // Merge Withings weight data if available
      let weight: unknown[] = [];
      if (withingsRes && withingsRes.ok) {
        try {
          const withingsJson = await withingsRes.json();
          weight = withingsJson.weight || [];
        } catch {
          // Withings data unavailable — continue without it
        }
      }

      const merged = { ...defaultData, ...json, weight };
      setData(merged);
      writeCache(merged, days);
      setLastUpdated(Date.now());
      setIsStale(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);

      // Stale-while-revalidate: fall back to cache on fetch failure
      if (!dataRef.current) {
        const entry = readCacheEntry();
        if (entry) {
          setData({ ...defaultData, ...entry.data });
          setLastUpdated(entry.timestamp);
          setIsStale(true);
        }
      } else {
        setIsStale(true);
      }
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
      value={{ data, loading, error, days, setDays, fetchData, lastUpdated, isOffline, isStale }}
    >
      {children}
    </OuraDataContext.Provider>
  );
}

export const useOuraData = () => useContext(OuraDataContext);
