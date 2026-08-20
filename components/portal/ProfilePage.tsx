"use client";

import Link from "next/link";
import { Bookmark, ChevronRight, LogOut, Settings, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  return <div className="utility-page profile-page"><div className="profile-hero"><div className="profile-avatar">{user?.email.slice(0, 1).toUpperCase() ?? "G"}</div><div><p className="eyebrow"><UserRound size={14} />YOUR STUDIO</p><h1>{user?.email ?? "Guest explorer"}</h1><p>{user ? "Your immersive library is ready." : "Sign in from the header to save experiences and points."}</p></div></div><div className="profile-grid"><div className="profile-panel"><div className="panel-heading"><h2>Library</h2><Bookmark size={18} /></div><Link href="/" className="profile-row"><span>Watch later</span><ChevronRight size={17} /></Link><Link href="/" className="profile-row"><span>Liked experiences</span><ChevronRight size={17} /></Link><Link href="/points" className="profile-row"><span>Points wallet</span><ChevronRight size={17} /></Link></div><div className="profile-panel"><div className="panel-heading"><h2>Account</h2><Settings size={18} /></div><div className="profile-row"><span>Notifications</span><i className="switch on" /></div><div className="profile-row"><span>Playback preferences</span><i className="switch on" /></div>{user && <button className="profile-row danger" type="button" onClick={logout}><span>Sign out</span><LogOut size={17} /></button>}</div></div><Link href="/" className="back-link">Back to discover</Link></div>;
}
