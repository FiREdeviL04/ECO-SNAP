export type RuntimeMode = "persistent" | "demo" | "misconfigured";

export function runtimeMode(): RuntimeMode {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (hasSupabase) return "persistent";
  if (demo) return "demo";
  return "misconfigured";
}
