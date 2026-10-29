import { NextResponse } from "next/server";
import { getAccessToken, getAuthUser } from "@/lib/auth";
import { z } from "zod";
const schema = z.object({ reportId: z.string().uuid(), note: z.string().trim().min(10).max(1000), imageUrl: z.string().url().startsWith("https://res.cloudinary.com/"), cloudinaryPublicId: z.string().trim().min(1).max(255) });
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || !["team_member", "admin"].includes(user.role)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Team-member access is required." } }, { status: user ? 403 : 401 });
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } }, { status: 400 }); }
  const parsed = schema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid resolution." } }, { status: 400 });
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, "");
  const response = await fetch(`${base}/rest/v1/rpc/resolve_report`, { method: "POST", headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${await getAccessToken()}`, "Content-Type": "application/json" }, body: JSON.stringify({ target_report: parsed.data.reportId, completion_note: parsed.data.note, completion_image_url: parsed.data.imageUrl, completion_public_id: parsed.data.cloudinaryPublicId }) });
  if (!response.ok) return NextResponse.json({ error: { code: "RESOLUTION_FAILED", message: "The report could not be resolved with the supplied evidence." } }, { status: 409 });
  return NextResponse.json({ report: await response.json() }, { headers: { "Cache-Control": "no-store" } });
}
