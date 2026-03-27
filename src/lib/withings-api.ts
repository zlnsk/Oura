// ---------------------------------------------------------------------------
// Withings API client – fetches weight/body composition measurements
// ---------------------------------------------------------------------------

import type { WithingsWeightEntry } from "@/types/oura";

const WITHINGS_API_URL = "https://wbsapi.withings.net/measure";

// Withings measure types
const MEASURE_TYPES = {
  WEIGHT: 1,
  FAT_MASS: 8,
  FAT_RATIO: 6,
  MUSCLE_MASS: 76,
  BONE_MASS: 88,
  HYDRATION: 77,
} as const;

interface WithingsMeasure {
  value: number;
  type: number;
  unit: number;
}

interface WithingsMeasureGroup {
  grpid: number;
  date: number;
  category: number;
  measures: WithingsMeasure[];
}

interface WithingsResponse {
  status: number;
  body: {
    measuregrps: WithingsMeasureGroup[];
    more: number;
    offset: number;
  };
}

function realValue(measure: WithingsMeasure): number {
  return measure.value * Math.pow(10, measure.unit);
}

function getMeasure(
  measures: WithingsMeasure[],
  type: number
): number | undefined {
  const m = measures.find((m) => m.type === type);
  return m ? realValue(m) : undefined;
}

export async function fetchWithingsWeight(
  token: string,
  days: number
): Promise<WithingsWeightEntry[]> {
  const now = Math.floor(Date.now() / 1000);
  const startDate = now - days * 86400;

  const params = new URLSearchParams({
    action: "getmeas",
    meastype: String(MEASURE_TYPES.WEIGHT),
    category: "1", // real measurements only
    startdate: String(startDate),
    enddate: String(now),
  });

  const response = await fetch(WITHINGS_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Withings API error: ${response.status}`);
  }

  const result: WithingsResponse = await response.json();

  if (result.status !== 0) {
    throw new Error(`Withings API returned status ${result.status}`);
  }

  const groups = result.body?.measuregrps || [];

  // Convert to our format, sorted by date ascending
  const entries: WithingsWeightEntry[] = groups
    .filter((g) => g.category === 1) // real measurements only
    .map((g) => {
      const date = new Date(g.date * 1000);
      const day = date.toISOString().slice(0, 10);
      const weight = getMeasure(g.measures, MEASURE_TYPES.WEIGHT);

      if (!weight) return null;

      return {
        day,
        weight: Math.round(weight * 100) / 100,
        fat_mass_weight: getMeasure(g.measures, MEASURE_TYPES.FAT_MASS),
        fat_ratio: getMeasure(g.measures, MEASURE_TYPES.FAT_RATIO),
        muscle_mass: getMeasure(g.measures, MEASURE_TYPES.MUSCLE_MASS),
        bone_mass: getMeasure(g.measures, MEASURE_TYPES.BONE_MASS),
        hydration: getMeasure(g.measures, MEASURE_TYPES.HYDRATION),
        timestamp: date.toISOString(),
      } satisfies WithingsWeightEntry;
    })
    .filter((e): e is WithingsWeightEntry => e !== null)
    .sort((a, b) => a.day.localeCompare(b.day));

  return entries;
}
