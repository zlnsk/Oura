const OURA_BASE_URL = "https://api.ouraring.com/v2/usercollection";

export async function fetchOuraData(
  endpoint: string,
  token: string,
  params?: Record<string, string>
) {
  const url = new URL(`${OURA_BASE_URL}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Oura API error (${res.status}): ${text}`);
  }

  return res.json();
}

export async function fetchPersonalInfo(token: string) {
  const res = await fetch(
    "https://api.ouraring.com/v2/usercollection/personal_info",
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };
}

export function getDateTimeRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start_datetime: start.toISOString(),
    end_datetime: end.toISOString(),
  };
}

export async function fetchAllOuraData(token: string, days: number = 30) {
  const dateRange = getDateRange(days);
  const dateTimeRange = getDateTimeRange(days);

  const endpoints = [
    { key: "sleep", endpoint: "daily_sleep", params: dateRange },
    { key: "sleepPeriods", endpoint: "sleep", params: dateRange },
    { key: "activity", endpoint: "daily_activity", params: dateRange },
    { key: "readiness", endpoint: "daily_readiness", params: dateRange },
    { key: "heartRate", endpoint: "heartrate", params: dateTimeRange },
    { key: "stress", endpoint: "daily_stress", params: dateRange },
    { key: "spo2", endpoint: "daily_spo2", params: dateRange },
    { key: "resilience", endpoint: "daily_resilience", params: dateRange },
    { key: "cardiovascularAge", endpoint: "daily_cardiovascular_age", params: dateRange },
    { key: "workouts", endpoint: "workout", params: dateRange },
    { key: "sessions", endpoint: "session", params: dateRange },
    { key: "vo2Max", endpoint: "vo2_max", params: dateRange },
    { key: "sleepTime", endpoint: "sleep_time", params: dateRange },
    { key: "tags", endpoint: "tag", params: dateRange },
  ];

  const results: Record<string, unknown[]> = {};

  const settled = await Promise.allSettled(
    endpoints.map(async ({ key, endpoint, params }) => {
      const data = await fetchOuraData(endpoint, token, params);
      return { key, data: data.data || [] };
    })
  );

  for (const result of settled) {
    if (result.status === "fulfilled") {
      results[result.value.key] = result.value.data;
    } else {
      const idx = settled.indexOf(result);
      results[endpoints[idx].key] = [];
    }
  }

  let personalInfo = null;
  try {
    personalInfo = await fetchPersonalInfo(token);
  } catch {
    // ignore
  }

  return { ...results, personalInfo };
}
