import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  COOKIE_MAX_AGE,
  AI_KEY_COOKIE_NAME,
  ANTHROPIC_KEY_PREFIX,
} from "@/lib/constants";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasKey = !!req.cookies.get(AI_KEY_COOKIE_NAME)?.value;
  return NextResponse.json({ hasKey });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { key?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { key } = body;
  if (!key || typeof key !== "string" || key.trim().length < 10) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
  }

  const trimmed = key.trim();
  if (!trimmed.startsWith(ANTHROPIC_KEY_PREFIX)) {
    return NextResponse.json(
      {
        error: `Invalid key format. Anthropic API keys start with ${ANTHROPIC_KEY_PREFIX}`,
      },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(AI_KEY_COOKIE_NAME, trimmed, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

export async function DELETE(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete(AI_KEY_COOKIE_NAME);
  return res;
}
