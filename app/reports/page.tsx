"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Report } from "@/lib/report";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const load = () => {
    setState("loading");
    fetch("/api/reports").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Could not load reports.");
      setReports(data.persistence === "supabase" ? data.reports : JSON.parse(localStorage.getItem("ecosnap-reports") || "[]"));
      setState("ready");
    }).catch(() => setState("error"));
  };
  useEffect(() => {
    fetch("/api/reports").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Could not load reports.");
      setReports(data.persistence === "supabase" ? data.reports : JSON.parse(localStorage.getItem("ecosnap-reports") || "[]"));
      setState("ready");
    }).catch(() => setState("error"));
  }, []);
  if (state === "loading") return <section className="shell section"><p role="status" className="muted">Loading reports…</p></section>;
  if (state === "error") return <section className="shell section"><div className="panel"><h1>Reports unavailable</h1><p className="muted">The report service could not be reached.</p><button className="btn" onClick={load}>Try again</button></div></section>;
  return <section className="shell section"><p className="eyebrow">Community reports</p><h1>Issues around campus</h1>{reports.length === 0 ? <div className="panel"><h3>No reports to show yet</h3><p className="muted">Submit the first verified report from the reporting form.</p><Link className="btn" href="/report">Report an issue</Link></div> : <div className="grid">{reports.map((report) => <Link className="card" href={`/reports/${report.id}`} key={report.id}><img src={report.imageUrl} alt={`Evidence for ${report.title}`} /><p className="badge">{report.status}</p><h3>{report.title}</h3><p className="muted">{report.location} · {report.severity} priority</p></Link>)}</div>}</section>;
}
