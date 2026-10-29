import { NextResponse } from "next/server";
import { authConfig, accessCookie, refreshCookie, getAuthUser, sessionCookieOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const credentials = z.object({
  action: z.enum(["login", "register", "logout", "me"]),
  email: z.string().trim().email().max(254).optional(),
  password: z.string().min(8).max(128).optional(),
});
const headers = { "Cache-Control": "no-store" };
const errorResponse = (code: string, message: string, status: number) => NextResponse.json({ error: { code, message } }, { status, headers });

export async function POST(request: Request) {
  const config = authConfig();
  if (!config) return errorResponse("CONFIGURATION_ERROR", "Authentication is not configured.", 503);
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400); }
  const parsed = credentials.safeParse(body);
  if (!parsed.success) return errorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message || "Invalid authentication request.", 400);
  if (parsed.data.action === "logout") {
    const response = NextResponse.json({ ok: true }, { headers });
    response.cookies.delete(accessCookie);
    response.cookies.delete(refreshCookie);
    return response;
  }
  if (parsed.data.action === "me") {
    const user = await getAuthUser();
    return NextResponse.json(user ? { authenticated: true, user } : { authenticated: false }, { headers });
  }
  const limit = rateLimit(`auth:${request.headers.get("x-forwarded-for") || "unknown"}`, 10);
  if (!limit.allowed) return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many authentication attempts. Try again shortly." } }, { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfter) } });
  if (!parsed.data.email || !parsed.data.password) return errorResponse("VALIDATION_ERROR", "Email and password are required.", 400);
  const endpoint = parsed.data.action === "register" ? "signup" : "token?grant_type=password";
  const response = await fetch(`${config.url}/auth/v1/${endpoint}`, {
    method: "POST",
    headers: { apikey: config.key, "Content-Type": "application/json" },
    body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({})) as { access_token?: string; refresh_token?: string; user?: { id?: string; email?: string }; msg?: string; error_description?: string };
  if (!response.ok) return errorResponse("AUTH_FAILED", data.error_description || data.msg || "Authentication failed.", response.status === 429 ? 429 : 401);
  if (parsed.data.action === "register" && (!data.access_token || !data.refresh_token)) {
    return NextResponse.json({ authenticated: false, needsEmailConfirmation: true }, { status: 201, headers });
  }
  if (!data.access_token || !data.refresh_token) return errorResponse("AUTH_FAILED", "Authentication did not return a valid session.", 401);
  const result = NextResponse.json({ authenticated: true, user: { id: data.user?.id, email: data.user?.email, role: "normal_user" }, needsEmailConfirmation: false }, { headers });
  const options = sessionCookieOptions();
  result.cookies.set(accessCookie, data.access_token, options);
  result.cookies.set(refreshCookie, data.refresh_token, options);
  return result;
}
