"use client";

import { useEffect, useState } from "react";

export default function RuntimeBanner() {
  const [mode, setMode] = useState<"demo" | "persistent" | "misconfigured" | "loading">("loading");
  useEffect(() => {
    fetch("/api/runtime").then(async (response) => {
      const data = await response.json();
      setMode(data.mode || "misconfigured");
    }).catch(() => setMode("misconfigured"));
  }, []);
  if (mode === "loading" || mode === "persistent") return null;
  if (mode === "demo") return <div className="runtime-banner" role="status">Demo mode: records are stored only in this browser and are not shared.</div>;
  return <div className="runtime-banner error" role="alert">Configuration required: persistent storage is not connected.</div>;
}
