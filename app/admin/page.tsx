"use client";
import { useEffect, useState } from "react";

type Application = { id: string; statement: string; status: string; created_at: string };
export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [message, setMessage] = useState("Loading applications…");
  useEffect(() => { fetch("/api/team-applications").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || "Administrator access is required."); setApplications(data.applications || []); setMessage(""); }).catch((error) => setMessage(error instanceof Error ? error.message : "Could not load applications.")); }, []);
  async function review(id: string, decision: "Approved" | "Rejected") {
    const response = await fetch(`/api/admin/applications/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
    const data = await response.json(); if (!response.ok) return setMessage(data.error?.message || "Review failed.");
    setApplications((current) => current.filter((item) => item.id !== id)); setMessage(`Application ${decision.toLowerCase()}.`);
  }
  return <section className="shell section"><p className="eyebrow">Protected workspace</p><h1>Team applications</h1>{message && <p className="notice" role="status">{message}</p>}{applications.map((application) => <article className="panel" key={application.id}><p>{application.statement}</p><p className="muted">{application.status} · {new Date(application.created_at).toLocaleDateString()}</p><button className="btn" onClick={() => review(application.id, "Approved")}>Approve</button> <button className="btn secondary" onClick={() => review(application.id, "Rejected")}>Reject</button></article>)}</section>;
}
