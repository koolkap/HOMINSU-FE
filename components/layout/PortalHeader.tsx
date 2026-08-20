"use client";

import { FormEvent, useState } from "react";
import { Bell, LogIn, Menu, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function PortalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("dev@hominsu.com");
  const [password, setPassword] = useState("demo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);

  function search(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/?q=${encodeURIComponent(value)}` : "/");
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const result = await api.auth.login(email, password);
      const profile = await api.auth.me(result.access_token).catch(() => ({ id: email, email, points: 0 }));
      setAuth(result.access_token, profile);
      setShowLogin(false);
    } catch {
      setError("The API is offline. You can still explore the local preview.");
    } finally { setBusy(false); }
  }

  return <>
    <header className="portal-header">
      <button className="mobile-menu-button" type="button" aria-label="Open navigation"><Menu size={21} /></button>
      <button className="portal-brand" type="button" onClick={() => router.push("/")} aria-label="HOMINSU home"><span className="brand-mark">H</span><span><strong>HOMINSU</strong><small>VR STUDIO</small></span></button>
      <nav className="header-links"><a className={pathname === "/" ? "active" : ""} href="/">Discover</a><a className={pathname === "/shorts" ? "active" : ""} href="/shorts">Shorts</a></nav>
      <form className="portal-search" onSubmit={search}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search immersive content" aria-label="Search immersive content" /></form>
      <button className="header-icon-button" type="button" aria-label="Notifications"><Bell size={18} /></button>
      {token && user ? <button className="profile-chip" type="button" onClick={() => router.push("/profile")}><span>{user.email.slice(0, 1).toUpperCase()}</span>{user.points}P</button> : <button className="header-login" type="button" onClick={() => setShowLogin(true)}><LogIn size={16} />Sign in</button>}
    </header>
    {showLogin && <div className="modal-backdrop" role="presentation" onClick={() => setShowLogin(false)}><form className="login-modal" onSubmit={login} onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setShowLogin(false)} aria-label="Close"><X size={18} /></button><span className="modal-mark">H</span><h2>Welcome to HOMINSU</h2><p>Sign in to unlock premium 360 experiences.</p><label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}<button className="button button-cyan login-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form></div>}
  </>;
}
