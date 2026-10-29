import { NextResponse } from "next/server";
import { getAccessToken, getAuthUser } from "@/lib/auth";
import { z } from "zod";
const schema = z.object({ decision: z.enum(["Approved", "Rejected"]), note: z.string().trim().max(1000).optional() });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Administrator access is required." } }, { status: user ? 403 : 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "A valid decision is required." } }, { status: 400 });
  const id = (await params).id; if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "A valid application ID is required." } }, { status: 400 });
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, "");
  const response = await fetch(`${base}/rest/v1/rpc/review_team_application`, { method: "POST", headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${await getAccessToken()}`, "Content-Type": "application/json" }, body: JSON.stringify({ target_application: id, decision: parsed.data.decision, review_reason: parsed.data.note || null }) });
  if (!response.ok) return NextResponse.json({ error: { code: "REVIEW_FAILED", message: "The application could not be reviewed." } }, { status: 409 });
  return NextResponse.json({ application: await response.json() }, { headers: { "Cache-Control": "no-store" } });
}
