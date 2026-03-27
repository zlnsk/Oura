import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchAllOuraData } from "@/lib/oura-api";
import {
  DEFAULT_DAYS,
  MAX_DAYS,
  MIN_DAYS,
  OURA_COOKIE_NAME,
  OURA_PROXY_DAILY_LIMIT,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter for the Oura proxy endpoint.
// Prevents quota exhaustion from excessive client-side polling.
// ---------------------------------------------------------------------------
const proxyLimiter = new Map<string, { count: number; resetAt: number }>();

function checkProxyRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = proxyLimiter.get(email);

  if (!entry || now > entry.resetAt) {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    proxyLimiter.set(email, { count: 1, resetAt: tomorrow.getTime() });
    return true;
  }

  if (entry.count >= OURA_PROXY_DAILY_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ouraToken = req.cookies.get(OURA_COOKIE_NAME)?.value;
  if (!ouraToken) {
    return NextResponse.json(
      { error: "No Oura API key configured" },
      { status: 400 }
    );
  }

  // Rate limit per user
  const email = session.user?.email || "unknown";
  if (!checkProxyRateLimit(email)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again tomorrow." },
      { status: 429 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const rawDays = parseInt(searchParams.get("days") || String(DEFAULT_DAYS), 10);
  const days = Number.isNaN(rawDays)
    ? DEFAULT_DAYS
    : Math.max(MIN_DAYS, Math.min(MAX_DAYS, rawDays));

  try {
    const data = await fetchAllOuraData(ouraToken, days);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Oura API error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json(
      {
        error:
          "Failed to fetch data from Oura. Please check your API key and try again.",
      },
      { status: 500 }
    );
  }
}
