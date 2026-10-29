"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Report } from "@/lib/report";

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("Loading your reports…");
  useEffect(() => { fetch("/api/reports?scope=mine&pageSize=20").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || "Sign in to view your dashboard."); setReports(data.reports || []); setMessage(""); }).catch((error) => setMessage(error instanceof Error ? error.message : "Could not load your dashboard.")); }, []);
  const counts = { open: reports.filter((report) => report.status === "Open").length, progress: reports.filter((report) => report.status === "In Progress").length, resolved: reports.filter((report) => report.status === "Resolved").length };
  return <section className="shell section"><div className="page-heading"><div><p className="eyebrow">Personal dashboard</p><h1>Your EcoSnap activity</h1></div><Link className="btn" href="/report">Report an issue</Link></div>{message && <p className="notice" role="status">{message}</p>}<div className="metric-grid"><article className="card"><span className="muted">Total reports</span><strong className="number">{reports.length}</strong></article><article className="card"><span className="muted">Awaiting action</span><strong className="number">{counts.open}</strong></article><article className="card"><span className="muted">Resolved</span><strong className="number">{counts.resolved}</strong></article></div>{reports.length > 0 && <div className="panel dashboard-list"><h2>Recent reports</h2>{reports.slice(0, 5).map((report) => <Link className="dashboard-row" href={`/reports/${report.id}`} key={report.id}><span><strong>{report.title}</strong><small className="muted">{report.location}</small></span><span className="badge">{report.status}</span></Link>)}</div>}</section>;
}
