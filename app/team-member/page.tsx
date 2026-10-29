"use client";
import { useEffect, useState } from "react";

export default function TeamMemberApplication() {
  const [statement, setStatement] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<{ status: string; statement: string } | null>(null);
  useEffect(() => { fetch("/api/team-applications").then(async (response) => { if (!response.ok) return; const data = await response.json(); const current = data.applications?.find((item: { status: string }) => item.status === "Pending") || data.applications?.[0]; if (current) { setExisting(current); setStatement(current.statement); } }).catch(() => undefined); }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/team-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statement }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || "Could not submit application.");
      setMessage("Application submitted. An administrator will review it.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit application."); }
    finally { setBusy(false); }
  }
  return <section className="shell section"><form className="form panel" onSubmit={submit}><p className="eyebrow">Team member application</p><h1>Help resolve campus issues</h1><p className="muted">Approved members claim open reports and submit evidence when work is complete.</p>{existing && <p className="notice" role="status">Current application: <strong>{existing.status}</strong>. You cannot submit a duplicate pending application.</p>}{message && <p className="notice" role="status">{message}</p>}<label className="field">Why would you like to join?<textarea required minLength={20} maxLength={1000} value={statement} onChange={(event) => setStatement(event.target.value)} placeholder="Tell the facilities team how you can help." disabled={Boolean(existing)} /></label><button className="btn" disabled={busy || Boolean(existing)}>{busy ? "Submitting…" : existing ? "Application already submitted" : "Submit application"}</button></form></section>;
}
