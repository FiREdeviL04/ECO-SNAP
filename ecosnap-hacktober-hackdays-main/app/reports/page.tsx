"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Report } from "@/lib/report";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => {
    const localReports = () => JSON.parse(localStorage.getItem("ecosnap-reports") || "[]") as Report[];
    fetch("/api/reports")
      .then((response) => response.json())
      .then((data) => setReports(data.persistence === "supabase" ? data.reports : localReports()))
      .catch(() => setReports(localReports()));
  }, []);
  return <section className="shell section"><p className="eyebrow">Community reports</p><h1>Issues around campus</h1>{reports.length === 0 ? <div className="panel"><h3>No reports to show yet</h3><p className="muted">Submit the first verified report from the reporting form.</p><Link className="btn" href="/report">Report an issue</Link></div> : <div className="grid">{reports.map((report) => <Link className="card" href={`/reports/${report.id}`} key={report.id}><img src={report.imageUrl} alt="Waste report"/><p className="badge">{report.status}</p><h3>{report.title}</h3><p className="muted">{report.location} · {report.severity} priority</p></Link>)}</div>}</section>;
}
