import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasKey = !!req.cookies.get("anthropic_api_key")?.value;
  return NextResponse.json({ hasKey });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await req.json();
  if (!key || typeof key !== "string" || key.trim().length < 10) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
  }

  const trimmed = key.trim();
  if (!trimmed.startsWith("sk-ant-")) {
    return NextResponse.json(
      { error: "Invalid key format. Anthropic API keys start with sk-ant-" },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("anthropic_api_key", trimmed, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 365 * 24 * 60 * 60,
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
  res.cookies.delete("anthropic_api_key");
  return res;
}
