"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, Headphones, Info, LockKeyhole } from "lucide-react";
import Link from "next/link";
import PaywallOverlay from "@/components/player/PaywallOverlay";
import PlayerActions from "@/components/player/PlayerActions";
import VR360Player from "@/components/player/VR360Player";
import api from "@/lib/api";
import { fallbackContent, normalizeContent } from "@/types/media";
import type { MediaContent } from "@/types/media";

export default function VRWatchScreen({ contentId }: { contentId: string }) {
  const [content, setContent] = useState<MediaContent>(() => fallbackContent.find((item) => item.id === contentId) ?? fallbackContent[0]);
  const [previewExpired, setPreviewExpired] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [paywallDismissed, setPaywallDismissed] = useState(false);

  useEffect(() => {
    api.content.get(contentId).then((item) => setContent(normalizeContent(item as unknown as Record<string, unknown>))).catch(() => undefined);
  }, [contentId]);

  const isPaid = content.pricePoints > 0;
  const source = content.mediaUrl ?? process.env.NEXT_PUBLIC_LIVE_HLS_URL ?? "";
  const showPaywall = isPaid && previewExpired && !unlocked && !paywallDismissed;
  const related = useMemo(() => fallbackContent.filter((item) => item.id !== content.id).slice(0, 3), [content.id]);

  return <div className="watch-page"><div className="watch-topline"><Link href="/" className="back-link"><ArrowLeft size={17} />Back to discover</Link><span className="watch-mode"><Headphones size={15} />Best with a headset</span></div><div className="watch-layout"><main><div className="watch-player-wrap"><VR360Player src={source} previewSeconds={isPaid ? 15 : 0} locked={showPaywall} onPreviewExpired={() => setPreviewExpired(true)} />{showPaywall && <PaywallOverlay contentId={content.id} price={content.pricePoints} onUnlocked={() => { setUnlocked(true); setPaywallDismissed(false); }} onDismiss={() => setPaywallDismissed(true)} />}{paywallDismissed && isPaid && !unlocked && <button className="resume-unlock" type="button" onClick={() => setPaywallDismissed(false)}><LockKeyhole size={15} />Unlock full experience</button>}</div><div className="watch-heading"><div><div className="watch-tags"><span>{content.category}</span><span>{content.type === "LIVE_360" ? "LIVE 360" : "360 VIDEO"}</span></div><h1>{content.title}</h1><p className="watch-description">{content.description}</p></div><PlayerActions /></div><div className="watch-byline"><div className="creator-avatar">{content.creator.slice(0, 1)}</div><div><strong>{content.creator}</strong><span>Original immersive production</span></div><span className="watch-stats"><Eye size={16} />{content.isLive ? `${content.viewerCount.toLocaleString()} watching` : content.duration}</span></div></main><aside className="watch-sidebar"><div className="sidebar-card"><p className="eyebrow"><Info size={13} />ABOUT THIS EXPERIENCE</p><p>Use your mouse or finger to look around. Enter VR for a full presence mode when your headset supports WebXR.</p><div className="info-row"><span>Format</span><strong>360° equirectangular</strong></div><div className="info-row"><span>Audio</span><strong>Spatial stereo</strong></div><div className="info-row"><span>Access</span><strong>{isPaid ? `${content.pricePoints} points` : "Free to watch"}</strong></div></div><div className="sidebar-card related-card"><p className="eyebrow">KEEP EXPLORING</p>{related.map((item) => <Link className="related-item" href={`/watch/${item.id}`} key={item.id}><span className="related-thumb" /><span><strong>{item.title}</strong><small>{item.category} · {item.duration}</small></span></Link>)}</div></aside></div></div>;
}
