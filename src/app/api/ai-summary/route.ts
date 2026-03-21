import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured on server" },
      { status: 500 }
    );
  }

  const { data } = await req.json();

  const prompt = buildAnalysisPrompt(data);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic API error: ${text}`);
    }

    const result = await response.json();
    const text = result.content?.[0]?.text || "{}";

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({ summary: parsed });
    } catch {
      return NextResponse.json({
        summary: {
          overall: text,
          sleep: "",
          activity: "",
          readiness: "",
          tip: "",
        },
      });
    }
  } catch (error) {
    console.error("AI summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary. Please try again later." },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(data: Record<string, unknown>): string {
  const sleep = data.sleep as Array<{ day: string; score: number }> || [];
  const activity = data.activity as Array<{ day: string; score: number; steps: number; total_calories: number }> || [];
  const readiness = data.readiness as Array<{ day: string; score: number }> || [];
  const stress = data.stress as Array<{ day: string; stress_high: number; recovery_high: number }> || [];
  const sleepPeriods = data.sleepPeriods as Array<{
    day: string;
    total_sleep_duration: number;
    deep_sleep_duration: number;
    rem_sleep_duration: number;
    average_hrv: number;
    average_heart_rate: number;
    lowest_heart_rate: number;
  }> || [];

  const sleepScores = sleep.map((s) => `${s.day}: ${s.score}`).join(", ");
  const activityScores = activity.map((a) => `${a.day}: score=${a.score} steps=${a.steps} cal=${a.total_calories}`).join(", ");
  const readinessScores = readiness.map((r) => `${r.day}: ${r.score}`).join(", ");
  const stressData = stress.map((s) => `${s.day}: stress_high=${s.stress_high} recovery=${s.recovery_high}`).join(", ");
  const sleepDetails = sleepPeriods.slice(-7).map((s) =>
    `${s.day}: total=${Math.round(s.total_sleep_duration / 60)}min deep=${Math.round(s.deep_sleep_duration / 60)}min rem=${Math.round(s.rem_sleep_duration / 60)}min hrv=${s.average_hrv} hr=${s.average_heart_rate} lowest_hr=${s.lowest_heart_rate}`
  ).join(", ");

  // Identify today's and last night's data
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySleep = sleep.find(s => s.day === todayStr) || sleep[sleep.length - 1];
  const todayActivity = activity.find(a => a.day === todayStr) || activity[activity.length - 1];
  const todayReadiness = readiness.find(r => r.day === todayStr) || readiness[readiness.length - 1];
  const lastNight = sleepPeriods.find(s => s.day === todayStr) || sleepPeriods[sleepPeriods.length - 1];

  const todaySection = [
    todaySleep ? `Sleep score: ${todaySleep.score} (${todaySleep.day})` : null,
    todayActivity ? `Activity score: ${(todayActivity as Record<string, unknown>).score}, steps: ${(todayActivity as Record<string, unknown>).steps}, calories: ${(todayActivity as Record<string, unknown>).total_calories} (${todayActivity.day})` : null,
    todayReadiness ? `Readiness score: ${todayReadiness.score} (${todayReadiness.day})` : null,
    lastNight ? `Last night: total=${Math.round(lastNight.total_sleep_duration / 60)}min deep=${Math.round(lastNight.deep_sleep_duration / 60)}min rem=${Math.round(lastNight.rem_sleep_duration / 60)}min hrv=${lastNight.average_hrv} hr=${lastNight.average_heart_rate} lowest_hr=${lastNight.lowest_heart_rate}` : null,
  ].filter(Boolean).join("\n");

  return `You are a concise health analyst for an Oura Ring dashboard. The user is checking their "Today" dashboard. Focus primarily on TODAY's data and last night's sleep. Use recent trends only for context. Respond with ONLY valid JSON (no markdown, no code fences).

## Today's Data
${todaySection || "No data yet today"}

## Recent Sleep Scores (for trend context)
${sleepScores || "No data"}

## Recent Sleep Details (last 7 nights)
${sleepDetails || "No data"}

## Recent Activity (for trend context)
${activityScores || "No data"}

## Recent Readiness (for trend context)
${readinessScores || "No data"}

## Stress Data
${stressData || "No data"}

Respond with this exact JSON structure:
{
  "overall": "2-3 sentences about how today looks — last night's sleep quality, today's readiness, and what to focus on today. Be specific with numbers. Compare to recent averages briefly.",
  "sleep": "One sentence about last night's sleep — what was good or concerning, with specific numbers (deep/REM time, HRV, HR).",
  "activity": "One sentence about today's activity progress so far and what to aim for.",
  "readiness": "One sentence about today's recovery status and how ready the body is.",
  "tip": "One specific, actionable tip for TODAY based on the data."
}`;
}
