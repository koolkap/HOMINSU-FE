import Link from "next/link";
import { Bookmark, CircleUserRound, Crown, Grid2X2, Headphones, Home, Radio, Sparkles, Video } from "lucide-react";

const links = [
  [Home, "Home", "/"], [Video, "VR Videos", "/?type=VOD"], [Grid2X2, "VR Photos", "/?type=PHOTO"],
  [Sparkles, "AI & Clips", "/shorts"], [Radio, "Live", "/?live=true"], [Headphones, "Subscriptions", "/profile"],
  [CircleUserRound, "Explore", "/?tab=explore"],
] as const;

export default function Sidebar() {
  return <aside className="portal-sidebar" aria-label="Primary navigation">
    <nav className="sidebar-main">
      {links.map(([Icon, label, href], index) => <Link className={index === 0 ? "sidebar-link active" : "sidebar-link"} href={href} key={label}><Icon size={18} />{label}</Link>)}
    </nav>
    <div className="sidebar-divider" />
    <nav className="sidebar-main">
      <Link className="sidebar-link premium-link" href="/points"><Crown size={18} />Premium</Link>
      <Link className="sidebar-link" href="/profile"><Bookmark size={18} />Watch later</Link>
    </nav>
    <div className="sidebar-status">
      <div className="status-title">PLAYBACK</div>
      <div className="status-row"><span>8K quality</span><i className="switch on" /></div>
      <div className="status-row"><span>VR mode</span><i className="switch on" /></div>
      <div className="status-row"><span>Show flat preview</span><i className="switch" /></div>
    </div>
  </aside>;
}
