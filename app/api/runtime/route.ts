import { NextResponse } from "next/server";
import { runtimeMode } from "@/lib/runtime";

export function GET() {
  return NextResponse.json({ mode: runtimeMode() }, { headers: { "Cache-Control": "no-store" } });
}
