"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { categories, severities, statuses, type Report } from "@/lib/report";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [filters, setFilters] = useState({ search: "", category: "", status: "", severity: "" });
  const [submittedFilters, setSubmittedFilters] = useState(filters);

  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  Object.entries(submittedFilters).forEach(([key, value]) => value && query.set(key, value));

  const fetchReports = (requestQuery: string) => {
    setState("loading");
    fetch(`/api/reports?${requestQuery}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Could not load reports.");
      setReports(data.persistence === "supabase" ? data.reports : JSON.parse(localStorage.getItem("ecosnap-reports") || "[]"));
      setTotal(data.persistence === "supabase" ? data.total : JSON.parse(localStorage.getItem("ecosnap-reports") || "[]").length);
      setState("ready");
    }).catch(() => setState("error"));
  };
  const load = () => fetchReports(query.toString());
  useEffect(() => {
    fetch(`/api/reports?${query.toString()}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Could not load reports.");
      setReports(data.persistence === "supabase" ? data.reports : JSON.parse(localStorage.getItem("ecosnap-reports") || "[]"));
      setTotal(data.persistence === "supabase" ? data.total : JSON.parse(localStorage.getItem("ecosnap-reports") || "[]").length);
      setState("ready");
    }).catch(() => setState("error"));
  // The query is intentionally derived from submitted filters, not every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, submittedFilters]);
  const submitFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSubmittedFilters(filters);
  };
  const clearFilters = () => {
    const empty = { search: "", category: "", status: "", severity: "" };
    setFilters(empty);
    setPage(1);
    setSubmittedFilters(empty);
  };
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (state === "loading") return <section className="shell section"><p role="status" className="muted">Loading reports…</p></section>;
  if (state === "error") return <section className="shell section"><div className="panel"><h1>Reports unavailable</h1><p className="muted">The report service could not be reached.</p><button className="btn" onClick={load}>Try again</button></div></section>;
  return <section className="shell section"><p className="eyebrow">Community reports</p><h1>Issues around campus</h1>
    <form className="filter-panel panel" onSubmit={submitFilters} aria-label="Filter reports">
      <label className="field"><span>Search reports</span><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search title, description, or location" maxLength={100} /></label>
      <div className="filter-grid">
        <label className="field"><span>Category</span><select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="field"><span>Status</span><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="field"><span>Priority</span><select value={filters.severity} onChange={(event) => setFilters({ ...filters, severity: event.target.value })}><option value="">All priorities</option>{severities.map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      <div className="filter-actions"><button className="btn" type="submit">Apply filters</button><button className="btn secondary" type="button" onClick={clearFilters}>Clear</button></div>
    </form>
    {reports.length === 0 ? <div className="panel"><h3>No matching reports</h3><p className="muted">{total === 0 ? "Submit the first verified report from the reporting form." : "Try clearing a filter or using a broader search."}</p>{total === 0 && <Link className="btn" href="/report">Report an issue</Link>}</div> : <><p className="muted results-summary" role="status">Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total} reports</p><div className="grid">{reports.map((report) => <Link className="card" href={`/reports/${report.id}?from=${encodeURIComponent(`/reports?${query.toString()}`)}`} key={report.id}><img src={report.imageUrl} alt={`Evidence for ${report.title}`} /><p className="badge">{report.status}</p><h3>{report.title}</h3><p className="muted">{report.location} · {report.severity} priority</p></Link>)}</div><nav className="pagination" aria-label="Report pages"><button className="btn secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span className="muted">Page {page} of {pageCount}</span><button className="btn secondary" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Next</button></nav></>}
  </section>;
}
