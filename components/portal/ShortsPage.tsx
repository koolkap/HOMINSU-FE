"use client";

import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

const shorts = [
  ["A quiet morning above the clouds", "@northfacevr", "card-alps"],
  ["The reef wakes up at first light", "@blueplanet", "card-reef"],
  ["Neon rain in Seoul", "@mirakim", "card-neon"],
] as const;

export default function ShortsPage() {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const current = shorts[index];
  return <div className="shorts-page"><div className="shorts-heading"><Link href="/" className="back-link"><ArrowLeft size={17} />Discover</Link><div><p className="eyebrow"><span className="eyebrow-dot cyan" />VERTICAL VR</p><h1>Shorts for a<br /><em>quick escape.</em></h1></div><span className="shorts-counter">0{index + 1} / 0{shorts.length}</span></div><div className="shorts-stage"><div className={`short-poster ${current[2]}`}><span className="shorts-label">HOMINSU SHORTS</span><div className="shorts-caption"><p>{current[1]}</p><h2>{current[0]}</h2><span>Tap and drag to explore the frame</span></div></div><div className="shorts-actions"><button type="button" onClick={() => setLiked(!liked)} className={liked ? "short-action active" : "short-action"}><Heart fill={liked ? "currentColor" : "none"} /><span>1.2K</span></button><button type="button" className="short-action"><MessageCircle /><span>84</span></button><button type="button" className="short-action"><Share2 /><span>Share</span></button></div></div><div className="shorts-nav"><button type="button" onClick={() => setIndex((index - 1 + shorts.length) % shorts.length)} aria-label="Previous short"><ArrowUp /></button><button type="button" onClick={() => setIndex((index + 1) % shorts.length)} aria-label="Next short"><ArrowDown /></button></div></div>;
}
