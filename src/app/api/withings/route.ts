import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchWithingsWeight } from "@/lib/withings-api";
import {
  DEFAULT_DAYS,
  MAX_DAYS,
  MIN_DAYS,
  WITHINGS_COOKIE_NAME,
} from "@/lib/constants";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withingsToken = req.cookies.get(WITHINGS_COOKIE_NAME)?.value;
  if (!withingsToken) {
    return NextResponse.json(
      { error: "No Withings API key configured" },
      { status: 400 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const rawDays = parseInt(
    searchParams.get("days") || String(DEFAULT_DAYS),
    10
  );
  const days = Number.isNaN(rawDays)
    ? DEFAULT_DAYS
    : Math.max(MIN_DAYS, Math.min(MAX_DAYS, rawDays));

  try {
    const weight = await fetchWithingsWeight(withingsToken, days);
    return NextResponse.json(
      { weight },
      {
        headers: {
          "Cache-Control":
            "private, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error(
      "Withings API error:",
      error instanceof Error ? error.message : "Unknown"
    );
    return NextResponse.json(
      {
        error:
          "Failed to fetch data from Withings. Please check your API key and try again.",
      },
      { status: 500 }
    );
  }
}
