import Link from "next/link";
import { Eye, Play } from "lucide-react";
import type { MediaContent } from "@/types/media";

const themes = ["card-reef", "card-sky", "card-neon", "card-alps", "card-city", "card-aurora"];

export default function ContentCard({ content, index = 0 }: { content: MediaContent; index?: number }) {
  return <article className="content-card">
    <Link href={`/watch/${content.id}`} className={`content-poster ${themes[index % themes.length]}`} style={content.posterUrl ? { backgroundImage: `linear-gradient(180deg, rgba(3, 9, 17, .1), rgba(3, 9, 17, .72)), url(${content.posterUrl})` } : undefined}>
      <div className="poster-top"><span className={content.isLive ? "live-badge" : "type-badge"}>{content.isLive ? "LIVE" : "VR360"}</span><span className="poster-viewers">{content.isLive ? <><Eye size={13} />{content.viewerCount.toLocaleString()}</> : `${content.pricePoints}P`}</span></div>
      <span className="poster-play"><Play size={17} fill="currentColor" /></span><span className="poster-duration">{content.duration}</span>
    </Link>
    <div className="content-card-copy"><div><p className="card-category">{content.category} · {content.creator}</p><h3><Link href={`/watch/${content.id}`}>{content.title}</Link></h3></div><button type="button" className="card-more" aria-label={`More options for ${content.title}`}>•••</button></div>
  </article>;
}
