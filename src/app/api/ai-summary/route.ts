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
        max_tokens: 2048,
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
    const text = result.content?.[0]?.text || "No analysis available.";

    return NextResponse.json({ summary: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
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

  return `You are a health and wellness analyst. Analyze this Oura Ring data and provide personalized, actionable insights. Be specific with numbers and trends. Use a friendly but professional tone.

## Sleep Scores (last 30 days)
${sleepScores || "No data"}

## Sleep Details (last 7 nights)
${sleepDetails || "No data"}

## Activity Data
${activityScores || "No data"}

## Readiness Scores
${readinessScores || "No data"}

## Stress Data
${stressData || "No data"}

Please provide:
1. **Overall Health Summary** - A brief overview of the user's health trends
2. **Sleep Analysis** - Deep dive into sleep quality, duration, HRV trends, and sleep stages
3. **Activity Insights** - Step counts, calories, and movement patterns
4. **Readiness & Recovery** - How well the body is recovering
5. **Stress & Resilience** - Stress patterns and recovery
6. **Top 3 Recommendations** - Specific, actionable advice based on the data
7. **Areas of Concern** - Any red flags or areas needing attention

Format with markdown headers and bullet points. Keep it concise but insightful.`;
}
