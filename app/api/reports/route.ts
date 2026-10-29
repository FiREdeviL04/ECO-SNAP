import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isCloudinaryAsset, reportSchema, type Report } from "@/lib/report";
import { runtimeMode } from "@/lib/runtime";
import { rateLimit } from "@/lib/rate-limit";
import { getAccessToken, getAuthUser } from "@/lib/auth";

const headers = { "Cache-Control": "no-store" };
const errorResponse = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status, headers });

function mapReport(x: Record<string, unknown>): Report {
  return {
    id: String(x.id),
    title: String(x.title),
    description: String(x.description),
    category: x.category as Report["category"],
    location: String(x.location),
    severity: x.severity as Report["severity"],
    status: x.status as Report["status"],
    imageUrl: String(x.image_url),
    cloudinaryPublicId: String(x.cloudinary_public_id),
    createdAt: String(x.created_at),
  };
}

export async function GET(req: Request) {
  const mode = runtimeMode();
  if (mode === "misconfigured") return errorResponse("CONFIGURATION_ERROR", "Persistent storage is not configured.", 503);
  if (mode === "demo") return NextResponse.json({ persistence: "browser-demo", reports: [] }, { headers });

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const searchParams = new URL(req.url).searchParams;
  const id = searchParams.get("id");
  const search = searchParams.get("search")?.trim().slice(0, 100);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  const page = Math.max(1, Math.min(1000, Number(searchParams.get("page") || 1) || 1));
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get("pageSize") || 20) || 20));
  const filters = [
    id ? `id=eq.${encodeURIComponent(id)}` : "",
    search ? `or=(title.ilike.*${encodeURIComponent(search)}*,description.ilike.*${encodeURIComponent(search)}*,location.ilike.*${encodeURIComponent(search)}*)` : "",
    category ? `category=eq.${encodeURIComponent(category)}` : "",
    status ? `status=eq.${encodeURIComponent(status)}` : "",
    severity ? `severity=eq.${encodeURIComponent(severity)}` : "",
  ].filter(Boolean).join("&");
  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;
  try {
    const response = await fetch(`${baseUrl}/rest/v1/reports?select=*&order=created_at.desc&${filters}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: `${rangeStart}-${rangeEnd}` },
      cache: "no-store",
    });
    if (!response.ok) return errorResponse("UPSTREAM_FAILURE", "Reports could not be loaded.", 502);
    const rows = await response.json();
    const total = Number(response.headers.get("content-range")?.split("/")[1] || rows.length);
    const metricEntries = await Promise.all(["Open", "In Progress", "Resolved"].map(async (value) => {
      const metricResponse = await fetch(`${baseUrl}/rest/v1/reports?select=id&status=eq.${encodeURIComponent(value)}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: "0-0" },
        cache: "no-store",
      });
      if (!metricResponse.ok) throw new Error("metric query failed");
      return [value, Number(metricResponse.headers.get("content-range")?.split("/")[1] || 0)] as const;
    }));
    return NextResponse.json({ persistence: "supabase", reports: rows.map(mapReport), page, pageSize, total, metrics: Object.fromEntries(metricEntries) }, { headers });
  } catch {
    return errorResponse("UPSTREAM_FAILURE", "Reports could not be loaded. Try again.", 502);
  }
}

export async function POST(req: Request) {
  const limit = rateLimit(`report-create:${req.headers.get("x-forwarded-for") || "unknown"}`, 10);
  if (!limit.allowed) return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many report submissions. Try again shortly." } }, { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfter) } });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message || "Invalid report.", 400);
  const mode = runtimeMode();
  const user = await getAuthUser();
  const rbacEnabled = process.env.ECOSNAP_RBAC_ENABLED === "true";
  if (mode === "persistent" && rbacEnabled && !user) return errorResponse("AUTHENTICATION_REQUIRED", "Sign in before creating a report.", 401);
  const isExplicitDemoAsset = mode === "demo" && parsed.data.imageUrl.startsWith("data:image/") && parsed.data.cloudinaryPublicId.startsWith("demo/");
  if (!isExplicitDemoAsset && !isCloudinaryAsset(parsed.data.imageUrl, parsed.data.cloudinaryPublicId)) {
    return errorResponse("INVALID_ASSET", "The image must be a verified EcoSnap Cloudinary asset.", 400);
  }
  if (mode === "misconfigured") return errorResponse("CONFIGURATION_ERROR", "Persistent storage is not configured.", 503);
  const id = randomUUID();
  const row = { ...parsed.data, id, status: "Open", created_at: new Date().toISOString() };
  if (mode === "demo") return NextResponse.json({ id, persistence: "browser-demo", report: row }, { status: 201, headers });

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const accessToken = await getAccessToken();
  const reportPayload: Record<string, unknown> = { id, title: row.title, description: row.description, category: row.category, location: row.location, severity: row.severity, image_url: row.imageUrl, cloudinary_public_id: row.cloudinaryPublicId };
  if (rbacEnabled && user) reportPayload.reporter_id = user.id;
  try {
    const response = await fetch(`${baseUrl}/rest/v1/reports`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${accessToken || key}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(reportPayload),
      cache: "no-store",
    });
    if (!response.ok) return errorResponse("UPSTREAM_FAILURE", "The report could not be saved. Try again.", 502);
    return NextResponse.json({ id, persistence: "supabase" }, { status: 201, headers });
  } catch {
    return errorResponse("UPSTREAM_FAILURE", "The report could not be saved. Try again.", 502);
  }
}
