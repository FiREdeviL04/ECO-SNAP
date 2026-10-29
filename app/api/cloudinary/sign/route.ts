import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const client = "cloudinary-sign:" + (req.headers.get("x-forwarded-for") || "unknown");
  const limit = rateLimit(client, 20);
  if (!limit.allowed) return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many upload requests. Try again shortly." } }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "ecosnap/reports";
  if (!cloudName || !apiKey || !secret) {
    return NextResponse.json({ error: { code: "CONFIGURATION_ERROR", message: "Cloudinary is not configured." } }, { status: 503 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  return NextResponse.json({ cloudName, apiKey, folder, timestamp, signature, maxBytes: 8 * 1024 * 1024 });
}
