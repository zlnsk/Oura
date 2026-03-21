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

  return `You are a concise health analyst for an Oura Ring dashboard. Analyze this data and respond with ONLY valid JSON (no markdown, no code fences).

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

Respond with this exact JSON structure:
{
  "overall": "One concise paragraph (2-3 sentences max) summarizing the current health picture, key trends, and one actionable takeaway. Be specific with numbers.",
  "sleep": "One sentence about last night / recent sleep quality and what stands out.",
  "activity": "One sentence about recent activity level and movement patterns.",
  "readiness": "One sentence about recovery status and body readiness.",
  "tip": "One specific, actionable health tip based on the data."
}`;
}
