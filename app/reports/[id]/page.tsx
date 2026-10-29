"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Report } from "@/lib/report";

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "not-found">("loading");
  useEffect(() => {
    fetch(`/api/reports?id=${encodeURIComponent(id)}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Could not load report.");
      const found = data.persistence === "supabase" ? data.reports[0] : JSON.parse(localStorage.getItem("ecosnap-reports") || "[]").find((item: Report) => item.id === id);
      setReport(found || null); setState(found ? "ready" : "not-found");
    }).catch(() => setState("error"));
  }, [id]);
  if (state === "loading") return <section className="shell section"><p role="status" className="muted">Loading report…</p></section>;
  if (state === "error") return <section className="shell section"><h1>Report unavailable</h1><p className="muted">The report service could not be reached.</p></section>;
  if (state === "not-found" || !report) return <section className="shell section"><h1>Report not found</h1><p className="muted">No report with this reference exists.</p></section>;
  return <section className="shell section"><div className="panel"><img className="preview" src={report.imageUrl} alt={report.title} /><p><span className="badge">{report.status}</span> <span className="status">{report.severity} priority</span></p><h1>{report.title}</h1><p className="muted">{report.category} · {report.location}</p><p>{report.description}</p><p className="muted">Reference: {report.id} · {new Date(report.createdAt).toLocaleDateString()}</p></div></section>;
}
