import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccessToken, getAuthUser } from "@/lib/auth";

const applicationSchema = z.object({ statement: z.string().trim().min(20).max(1000) });
const errorResponse = (code: string, message: string, status: number) => NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return errorResponse("AUTHENTICATION_REQUIRED", "Sign in to apply.", 401);
  if (user.role !== "normal_user") return errorResponse("FORBIDDEN", "Only normal users can submit an application.", 403);
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400); }
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message || "Invalid application.", 400);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, "");
  const token = await getAccessToken();
  const response = await fetch(`${url}/rest/v1/team_member_applications`, { method: "POST", headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ applicant_id: user.id, statement: parsed.data.statement }) });
  if (!response.ok) return errorResponse("UPSTREAM_FAILURE", "The application could not be submitted.", 502);
  return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return errorResponse("AUTHENTICATION_REQUIRED", "Sign in to view applications.", 401);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, "");
  const token = await getAccessToken();
  const filter = user.role === "admin" ? "" : `&applicant_id=eq.${encodeURIComponent(user.id)}`;
  const response = await fetch(`${url}/rest/v1/team_member_applications?select=*&order=created_at.desc${filter}`, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return errorResponse("UPSTREAM_FAILURE", "Applications could not be loaded.", 502);
  return NextResponse.json({ applications: await response.json() }, { headers: { "Cache-Control": "no-store" } });
}
