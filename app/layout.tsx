import "./globals.css";
import Link from "next/link";
export const metadata={title:"EcoSnap — Campus waste reporting",description:"See the problem. Report it. Make campus cleaner."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><header className="shell"><nav className="nav"><Link className="brand" href="/">EcoSnap</Link><div className="navlinks"><Link href="/reports">Reports</Link><Link href="/about">About</Link><Link className="btn" href="/report">Report an issue</Link></div></nav></header><main>{children}</main><footer className="footer"><div className="shell">EcoSnap · Cloudinary-powered campus waste reporting</div></footer></body></html>}
