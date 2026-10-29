"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Report } from "@/lib/report";

export default function TeamDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("Loading team workload…");
  const [busy, setBusy] = useState("");
  useEffect(() => { fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "me" }) }).then((response) => response.json()).then((auth) => { if (!auth.authenticated || !["team_member", "admin"].includes(auth.user.role)) throw new Error("Team-member access is required."); return fetch("/api/reports?status=Open&pageSize=20"); }).then((response) => response.json()).then((data) => { if (data.error) throw new Error(data.error.message); setReports(data.reports || []); setMessage(""); }).catch((error) => setMessage(error instanceof Error ? error.message : "Could not load workload.")); }, []);
  async function claim(reportId: string) {
    setBusy(reportId); setMessage("");
    const response = await fetch("/api/team/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId }) });
    const data = await response.json(); setBusy(""); if (!response.ok) return setMessage(data.error?.message || "Could not claim report.");
    setReports((current) => current.filter((report) => report.id !== reportId)); setMessage("Report claimed and moved to In Progress.");
  }
  return <section className="shell section"><p className="eyebrow">Protected workspace</p><h1>Team workload</h1>{message && <p className="notice" role="status">{message}</p>}<div className="grid">{reports.map((report) => <article className="card" key={report.id}><h3>{report.title}</h3><p className="muted">{report.location} · {report.severity} priority</p><Link className="btn secondary" href={`/reports/${report.id}`}>View report</Link> <button className="btn" disabled={busy === report.id} onClick={() => claim(report.id)}>{busy === report.id ? "Claiming…" : "Claim report"}</button></article>)}</div></section>;
}
