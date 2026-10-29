import "./globals.css";
import Link from "next/link";
import RuntimeBanner from "@/components/runtime-banner";
export const metadata={title:"EcoSnap — Smart campus care",description:"See the problem. Report it. Fix it.",applicationName:"EcoSnap"};
export const viewport={width:"device-width",initialScale:1,themeColor:"#166445"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><RuntimeBanner/><header className="site-header"><nav className="shell nav" aria-label="Main navigation"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">E</span>EcoSnap</Link><div className="navlinks"><Link href="/reports">Reports</Link><Link href="/dashboard">Dashboard</Link><Link href="/team-member">Join team</Link><Link href="/about">About</Link><Link href="/login">Sign in</Link><Link className="btn" href="/report">Report an issue</Link></div></nav></header><main>{children}</main><footer className="footer"><div className="shell">EcoSnap · Smart campus care · See the problem. Report it. Fix it.</div></footer></body></html>}
