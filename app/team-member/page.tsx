"use client";
import { useState } from "react";

export default function TeamMemberApplication() {
  const [statement, setStatement] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/team-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statement }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || "Could not submit application.");
      setMessage("Application submitted. An administrator will review it.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit application."); }
    finally { setBusy(false); }
  }
  return <section className="shell section"><form className="form panel" onSubmit={submit}><p className="eyebrow">Team member application</p><h1>Help resolve campus issues</h1>{message && <p className="notice" role="status">{message}</p>}<label className="field">Why would you like to join?<textarea required minLength={20} maxLength={1000} value={statement} onChange={(event) => setStatement(event.target.value)} placeholder="Tell the facilities team how you can help." /></label><button className="btn" disabled={busy}>{busy ? "Submitting…" : "Submit application"}</button></form></section>;
}
