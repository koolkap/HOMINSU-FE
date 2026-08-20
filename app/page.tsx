"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bell, Bookmark, ChevronRight, CircleUserRound, Crown, Image as ImageIcon, LayoutGrid, LogIn, Menu, Play, Radio, Search, Sparkles, Upload, Video, X } from "lucide-react";

type Content = { id: string; title: string; type: "VOD" | "LIVE_360" | "SHORT_FORM"; media_url: string | null; price_points: number; is_live: boolean; viewer_count: number };
const fallbackContent: Content[] = [
  { id: "reef", title: "심해 3,000M 마리아나 해구 잠수", type: "LIVE_360", media_url: null, price_points: 0, is_live: true, viewer_count: 1240 },
  { id: "iss", title: "ISS 국제우주정거장 도킹 생중계", type: "LIVE_360", media_url: null, price_points: 0, is_live: true, viewer_count: 842 },
  { id: "cyber", title: "금요일 밤 사이버펑크 파티", type: "LIVE_360", media_url: null, price_points: 100, is_live: true, viewer_count: 2148 },
  { id: "alps", title: "알프스 에귀디미디 실시간 등반", type: "LIVE_360", media_url: null, price_points: 100, is_live: true, viewer_count: 412 },
  { id: "seoul", title: "네온 서울 2088: 타이브 야간 비행 투어", type: "VOD", media_url: null, price_points: 100, is_live: false, viewer_count: 0 },
];
const apiBase = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [contents, setContents] = useState(fallbackContent);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("MY FEED");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("dev@hominsh.com");
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    fetch(`${apiBase()}/api/v1/contents`)
      .then(async (response) => { if (!response.ok) throw new Error("API error"); return response.json() as Promise<Content[]>; })
      .then((data) => setContents(data.length ? data : fallbackContent))
      .catch(() => setApiError("Backend is offline. Showing the preview catalog."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => contents.filter((content) => content.title.toLowerCase().includes(query.toLowerCase())), [contents, query]);
  const live = filtered.filter((content) => content.is_live);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoginBusy(true);
    try {
      const response = await fetch(`${apiBase()}/api/v1/auth/social-login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name: email.split("@")[0], provider: "local" }) });
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json(); localStorage.setItem("hominsu_access_token", data.access_token); setShowLogin(false);
    } catch { setApiError("Could not connect to the backend. Start FastAPI on port 8000 and try again."); } finally { setLoginBusy(false); }
  }

  return <div className="studio-shell">
    <header className="topbar"><button className="mobile-menu" aria-label="Open menu"><Menu size={22} /></button><div className="brand"><span className="brand-mark">◆</span><span><strong>HOMINSU</strong><small>VR STUDIO</small></span></div><nav className="top-links"><a className="active" href="#home">홈</a><a href="#explore">검색</a></nav><label className="search"><Search size={22} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="가상현실 콘텐츠 검색" /></label><button className="upload"><Upload size={18} /> UPLOAD</button><button className="icon-button" aria-label="Notifications"><Bell size={20} /></button><button className="login-button" onClick={() => setShowLogin(true)}><LogIn size={17} /> 로그인</button></header>
    <aside className="sidebar"><div className="side-main">{[[Video, "VR VIDEOS"], [ImageIcon, "VR PHOTOS"], [Sparkles, "AI & CLIPS"], [Radio, "LIVE"], [Bell, "SUBSCRIPTIONS"], [LayoutGrid, "PLAYLISTS"], [CircleUserRound, "EXPLORE"]].map(([Icon, label], index) => <a className={index === 0 ? "side-link selected" : "side-link"} href="#explore" key={label as string}><Icon size={21} /> {label as string}</a>)}</div><div className="side-lower"><a className="side-link premium" href="#premium"><Crown size={21} /> PREMIUM</a><a className="side-link" href="#later"><Bookmark size={21} /> WATCH LATER</a><div className="settings"><span>8K</span><span className="toggle" /><span>VR만 보기</span><span className="toggle" /><span>Show Flat</span><span className="toggle on" /><span>성인 콘텐츠 숨기기</span><span className="toggle on" /></div></div></aside>
    <main className="content" id="home"><section className="intro"><p className="eyebrow"><span /> HOMINSU ORIGINALS</p><h1>새로운 세계를<br /><em>360°로</em> 경험하세요</h1><p className="intro-copy">서울의 미래부터 지구 끝까지, 지금 가장 핫한 VR 라이브.</p><div className="intro-actions"><button className="primary"><Play size={17} fill="currentColor" /> 시청하기</button><button className="secondary">상세 정보 <ChevronRight size={16} /></button></div></section><section className="catalog" id="explore"><div className="section-heading"><h2><span className="live-dot" /> LIVE NOW</h2><button>전체보기 <ChevronRight size={15} /></button></div><div className="tabs">{["MY FEED", "NEW", "TRENDING", "TOP PICKS"].map((tab) => <button className={activeTab === tab ? "tab active" : "tab"} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>)}</div>{apiError && <p className="api-notice">{apiError}</p>}{loading && <p className="loading">콘텐츠를 불러오는 중...</p>}<div className="content-grid">{(live.length ? live : filtered).map((content, index) => <article className={`content-card theme-${["reef", "sky", "party", "alps", "neon"][index % 5]}`} key={content.id}><div className="poster"><span className="live-badge">{content.is_live ? "● LIVE" : "VR360"}</span><span className="viewer-badge">{content.is_live ? `${content.viewer_count.toLocaleString()}명` : `${content.price_points}P`}</span><button className="card-play" aria-label={`${content.title} 재생`}><Play size={20} fill="currentColor" /></button></div><h3>{content.title}</h3><p>{content.is_live ? "LIVE VR" : "HOMINSU ORIGINAL"}</p></article>)}</div></section></main>
    {showLogin && <div className="modal-backdrop" onClick={() => setShowLogin(false)}><form className="login-modal" onSubmit={handleLogin} onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setShowLogin(false)}><X size={20} /></button><span className="modal-mark">◆</span><h2>HOMINSU에 로그인</h2><p>VR 콘텐츠를 이어서 감상하세요.</p><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="이메일 주소" /><button className="primary login-submit" disabled={loginBusy}>{loginBusy ? "로그인 중..." : "로그인"}</button></form></div>}
  </div>;
}