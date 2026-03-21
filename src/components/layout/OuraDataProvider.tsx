"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { DashboardData } from "@/types/oura";

interface OuraDataContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;
  fetchData: () => Promise<void>;
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
});

export function OuraDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

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
      setData({ ...defaultData, ...json });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  return (
    <OuraDataContext.Provider
      value={{ data, loading, error, days, setDays, fetchData }}
    >
      {children}
    </OuraDataContext.Provider>
  );
}

export const useOuraData = () => useContext(OuraDataContext);
