import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  COOKIE_MAX_AGE,
  OURA_COOKIE_NAME,
  OURA_TOKEN_MIN_LENGTH,
  OURA_TOKEN_PATTERN,
} from "@/lib/constants";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasToken = !!req.cookies.get(OURA_COOKIE_NAME)?.value;
  return NextResponse.json({ hasToken });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { token } = body;
  if (
    !token ||
    typeof token !== "string" ||
    token.trim().length < OURA_TOKEN_MIN_LENGTH
  ) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const trimmed = token.trim();
  if (!OURA_TOKEN_PATTERN.test(trimmed)) {
    return NextResponse.json(
      {
        error:
          "Invalid token format. Token must contain only letters, numbers, hyphens, and underscores.",
      },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(OURA_COOKIE_NAME, trimmed, {
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
  res.cookies.delete(OURA_COOKIE_NAME);
  return res;
}
