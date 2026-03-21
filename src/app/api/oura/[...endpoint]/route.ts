import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchAllOuraData } from "@/lib/oura-api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ouraToken = req.cookies.get("oura_api_key")?.value;
  if (!ouraToken) {
    return NextResponse.json(
      { error: "No Oura API key configured" },
      { status: 400 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "30", 10);

  try {
    const data = await fetchAllOuraData(ouraToken, days);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
