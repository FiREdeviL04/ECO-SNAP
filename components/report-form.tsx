"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories, reportSchema, severities } from "@/lib/report";

export default function ReportForm() {
  const router = useRouter();
  const [upload, setUpload] = useState<{ url: string; publicId: string } | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const uploadFile = async (file: File) => {
    setErr("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return setErr("Please select a JPG, PNG, WebP, or GIF image.");
    if (file.size > 8 * 1024 * 1024) return setErr("Images must be 8 MB or smaller.");
    setBusy(true);
    try {
      const runtime = await fetch("/api/runtime").then((response) => response.json());
      if (runtime.mode === "demo") {
        const reader = new FileReader();
        reader.onload = () => setUpload({ url: String(reader.result), publicId: `demo/${crypto.randomUUID()}` });
        reader.readAsDataURL(file);
        return;
      }
      const signature = await fetch("/api/cloudinary/sign", { method: "POST" });
      const s = await signature.json();
      if (!signature.ok) throw new Error(s.error?.message || "Cloudinary is not configured.");
      const data = new FormData();
      Object.entries({ api_key: s.apiKey, timestamp: String(s.timestamp), folder: s.folder, signature: s.signature }).forEach(([key, value]) => data.set(key, value));
      data.set("file", file);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: data });
      const output = await response.json();
      if (!response.ok || typeof output.secure_url !== "string" || typeof output.public_id !== "string") throw new Error(output.error?.message || "Upload failed.");
      setUpload({ url: output.secure_url, publicId: output.public_id });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Upload failed. Try again.");
    } finally { setBusy(false); }
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setErr("");
    if (!upload) return setErr("Upload an image before submitting your report.");
    const form = new FormData(event.currentTarget);
    const parsed = reportSchema.safeParse({ title: form.get("title"), description: form.get("description"), category: form.get("category"), location: form.get("location"), severity: form.get("severity"), imageUrl: upload.url, cloudinaryPublicId: upload.publicId });
    if (!parsed.success) return setErr(parsed.error.issues[0]?.message || "Please check the form.");
    setBusy(true);
    try {
      const response = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Could not save report.");
      if (data.persistence === "browser-demo") {
        const reports = JSON.parse(localStorage.getItem("ecosnap-reports") || "[]");
        localStorage.setItem("ecosnap-reports", JSON.stringify([data.report, ...reports]));
      }
      router.push(`/reports/${data.id}`);
    } catch (error) { setErr(error instanceof Error ? error.message : "Could not submit report."); }
    finally { setBusy(false); }
  };
  return <form className="form panel" onSubmit={submit}><span className="badge">Image required · Cloudinary in production</span><h1>Report a campus issue</h1><p className="muted">Your photo is verified through Cloudinary in persistent mode. Demo mode keeps it in this browser only.</p>{err && <p className="error" role="alert">{err}</p>}<label className="field">Issue title<input name="title" maxLength={100} required placeholder="Overflowing bin near library" /></label><label className="field">Category<select name="category">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="field">Campus location<input name="location" maxLength={100} required placeholder="Main Library" /></label><label className="field">Priority<select name="severity">{severities.map((severity) => <option key={severity}>{severity}</option>)}</select></label><label className="field">What needs attention?<textarea name="description" maxLength={600} required placeholder="Describe the issue and any useful landmarks." /></label><div className="upload"><strong>{busy ? "Working…" : "Upload evidence"}</strong><p className="muted">JPG, PNG, WebP or GIF · up to 8 MB</p><input aria-label="Issue photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0])} />{upload && <><img className="preview" src={upload.url} alt="Uploaded evidence preview" /><p className="badge">{upload.publicId.startsWith("demo/") ? "Stored in local demo mode" : "Uploaded to Cloudinary"}</p></>}</div><button className="btn" disabled={busy} type="submit" style={{ marginTop: 18 }}>{busy ? "Please wait…" : "Submit report"}</button></form>;
}
