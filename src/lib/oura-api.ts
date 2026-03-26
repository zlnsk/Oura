const OURA_BASE_URL = "https://api.ouraring.com/v2/usercollection";
const CHUNK_SIZE_DAYS = 90;

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

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  // Oura API end_date is exclusive, so add 1 day to include today
  const endInclusive = new Date(end);
  endInclusive.setDate(endInclusive.getDate() + 1);
  return {
    start_date: toLocalDateStr(start),
    end_date: toLocalDateStr(endInclusive),
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

// ---------------------------------------------------------------------------
// Chunked date ranges – split large requests into ≤ CHUNK_SIZE_DAYS pieces
// to avoid Oura API rate limits and timeouts on long ranges.
// ---------------------------------------------------------------------------

interface DateChunk {
  start_date: string;
  end_date: string;
}

interface DateTimeChunk {
  start_datetime: string;
  end_datetime: string;
}

function chunkDateRange(days: number): DateChunk[] {
  if (days <= CHUNK_SIZE_DAYS) return [getDateRange(days)];

  const chunks: DateChunk[] = [];
  const now = new Date();
  let remaining = days;

  while (remaining > 0) {
    const chunkDays = Math.min(remaining, CHUNK_SIZE_DAYS);
    const chunkEnd = new Date(now);
    chunkEnd.setDate(chunkEnd.getDate() - (days - remaining) + 1); // exclusive
    const chunkStart = new Date(now);
    chunkStart.setDate(chunkStart.getDate() - (days - remaining + chunkDays));

    chunks.push({
      start_date: toLocalDateStr(chunkStart),
      end_date: toLocalDateStr(chunkEnd),
    });

    remaining -= chunkDays;
  }

  return chunks;
}

function chunkDateTimeRange(days: number): DateTimeChunk[] {
  if (days <= CHUNK_SIZE_DAYS) return [getDateTimeRange(days)];

  const chunks: DateTimeChunk[] = [];
  const now = new Date();
  let remaining = days;

  while (remaining > 0) {
    const chunkDays = Math.min(remaining, CHUNK_SIZE_DAYS);
    const chunkEnd = new Date(now);
    chunkEnd.setDate(chunkEnd.getDate() - (days - remaining));
    const chunkStart = new Date(now);
    chunkStart.setDate(chunkStart.getDate() - (days - remaining + chunkDays));

    chunks.push({
      start_datetime: chunkStart.toISOString(),
      end_datetime: chunkEnd.toISOString(),
    });

    remaining -= chunkDays;
  }

  return chunks;
}

/** Fetch a single endpoint across all date chunks and merge results. */
async function fetchChunked(
  endpoint: string,
  token: string,
  chunks: (DateChunk | DateTimeChunk)[]
): Promise<unknown[]> {
  const results: unknown[] = [];

  // Sequential to respect rate limits
  for (const chunk of chunks) {
    const data = await fetchOuraData(endpoint, token, chunk as Record<string, string>);
    if (data.data) results.push(...data.data);
  }

  return results;
}

export async function fetchAllOuraData(token: string, days: number = 30) {
  const dateChunks = chunkDateRange(days);
  const dateTimeChunks = chunkDateTimeRange(days);

  const endpoints = [
    { key: "sleep", endpoint: "daily_sleep", chunks: dateChunks },
    { key: "sleepPeriods", endpoint: "sleep", chunks: dateChunks },
    { key: "activity", endpoint: "daily_activity", chunks: dateChunks },
    { key: "readiness", endpoint: "daily_readiness", chunks: dateChunks },
    { key: "heartRate", endpoint: "heartrate", chunks: dateTimeChunks },
    { key: "stress", endpoint: "daily_stress", chunks: dateChunks },
    { key: "spo2", endpoint: "daily_spo2", chunks: dateChunks },
    { key: "resilience", endpoint: "daily_resilience", chunks: dateChunks },
    { key: "cardiovascularAge", endpoint: "daily_cardiovascular_age", chunks: dateChunks },
    { key: "workouts", endpoint: "workout", chunks: dateChunks },
    { key: "sessions", endpoint: "session", chunks: dateChunks },
    { key: "vo2Max", endpoint: "vo2_max", chunks: dateChunks },
    { key: "sleepTime", endpoint: "sleep_time", chunks: dateChunks },
    { key: "tags", endpoint: "tag", chunks: dateChunks },
  ];

  const results: Record<string, unknown[]> = {};

  const settled = await Promise.allSettled(
    endpoints.map(async ({ key, endpoint, chunks }) => {
      const data = await fetchChunked(endpoint, token, chunks);
      return { key, data };
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
