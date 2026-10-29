"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: register ? "register" : "login", email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Authentication failed.");
      if (register && data.needsEmailConfirmation) {
        setMessage("Account created. Check your email before signing in.");
      } else {
        setMessage("Signed in successfully.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Authentication failed."); }
    finally { setBusy(false); }
  }
  return <section className="shell section"><form className="form panel" onSubmit={submit}><p className="eyebrow">{register ? "Create your account" : "Welcome back"}</p><h1>{register ? "Join EcoSnap" : "Sign in"}</h1><p className="muted">{register ? "Join your campus community and help make progress visible." : "Access your reports, team workspace, and campus activity."}</p>{message && <p className="notice" role="status">{message}</p>}<label className="field">Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label><label className="field">Password<input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={register ? "new-password" : "current-password"} /></label><button className="btn" disabled={busy}>{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</button><p className="muted">{register ? "Already have an account? " : "Need an account? "}<button className="link-button" type="button" onClick={() => { setRegister(!register); setMessage(""); }}>{register ? "Sign in" : "Register"}</button></p><Link href="/reports" className="muted">Continue browsing reports</Link></form></section>;
}
