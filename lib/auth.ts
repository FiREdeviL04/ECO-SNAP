import { cookies } from "next/headers";

export const accessCookie = "ecosnap-access-token";
export const refreshCookie = "ecosnap-refresh-token";
export type AppRole = "normal_user" | "team_member" | "admin";
export type AuthUser = { id: string; email?: string; role: AppRole };

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const config = supabaseConfig();
  if (!config) return null;
  const token = (await cookies()).get(accessCookie)?.value;
  if (!token) return null;
  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: { apikey: config.key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = await response.json() as { id?: string; email?: string };
  if (!user.id) return null;
  const profileResponse = await fetch(`${config.url}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(user.id)}&limit=1`, {
    headers: { apikey: config.key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const profiles = profileResponse.ok ? await profileResponse.json() as Array<{ role?: AppRole }> : [];
  return { id: user.id, email: user.email, role: profiles[0]?.role || "normal_user" };
}

export async function getAccessToken() {
  return (await cookies()).get(accessCookie)?.value || null;
}

export function authConfig() {
  return supabaseConfig();
}

export function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };
}
