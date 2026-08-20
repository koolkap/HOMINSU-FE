"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Compass, Play, Radio, Sparkles } from "lucide-react";
import ContentCard from "@/components/portal/ContentCard";
import api from "@/lib/api";
import { fallbackContent, normalizeContent } from "@/types/media";

const tabs = ["For you", "New releases", "Trending", "Top picks"];

export default function PortalHome() {
  const [contents, setContents] = useState(fallbackContent);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    api.content.list().then((result) => {
      const items = Array.isArray(result) ? result : result.items;
      if (items.length) setContents(items.map((item) => normalizeContent(item as unknown as Record<string, unknown>)));
    }).catch(() => setOffline(true)).finally(() => setLoading(false));
  }, []);

  const live = contents.filter((content) => content.isLive);
  const filtered = useMemo(() => contents.filter((content) => `${content.title} ${content.category} ${content.creator}`.toLowerCase().includes(query.toLowerCase())), [contents, query]);

  return <div className="portal-page">
    <section className="portal-hero">
      <div className="hero-glow" />
      <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" />HOMINSU ORIGINALS</p><h1>See the world<br /><em>in 360 degrees.</em></h1><p>From the bottom of the ocean to the edge of space, step into stories made for presence.</p><div className="hero-actions"><Link className="button button-cyan" href="/watch/reef"><Play size={16} fill="currentColor" />Watch live</Link><a className="button button-ghost" href="#explore">Explore library<ArrowRight size={16} /></a></div></div>
      <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-meta"><span><strong>01</strong>/ 06</span><span className="hero-dashes">━ ━ ━ ━ ━</span></div>
    </section>

    <section className="catalog-section" id="explore"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-dot cyan" />CURATED FOR YOU</p><h2>Explore <em>immersive</em> worlds</h2></div><Link className="text-link" href="/?tab=explore">View all <ChevronRight size={16} /></Link></div>
      <div className="mobile-filter"><Compass size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter this collection" /></div>
      <div className="tabs">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={activeTab === tab ? "tab active" : "tab"}>{tab}</button>)}</div>
      {offline && <p className="api-notice">The studio API is offline, so this page is showing the preview catalog.</p>}
      {loading && <p className="loading-copy">Loading the latest experiences…</p>}
      <div className="content-grid">{filtered.map((content, index) => <ContentCard key={content.id} content={content} index={index} />)}</div>
    </section>

    <section className="live-strip"><div><p className="eyebrow"><span className="eyebrow-dot red" />HAPPENING NOW</p><h2>Live from everywhere.</h2><p>Join viewers already exploring the planet together.</p></div><div className="live-strip-stat"><Radio size={22} /><strong>{live.reduce((total, content) => total + content.viewerCount, 0).toLocaleString()}</strong><span>viewers online</span></div><Link className="button button-dark" href="/?live=true">See live channels<ChevronRight size={16} /></Link></section>
    <section className="creator-banner"><div><p className="eyebrow"><Sparkles size={14} />FOR CREATORS</p><h2>Your perspective<br /><em>belongs here.</em></h2></div><button className="button button-cyan" type="button">Start creating <ArrowRight size={16} /></button></section>
  </div>;
}
