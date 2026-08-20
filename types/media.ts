export type ContentType = "VOD" | "LIVE_360" | "SHORT_FORM";

export type MediaContent = {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  mediaUrl: string | null;
  posterUrl?: string | null;
  pricePoints: number;
  isLive: boolean;
  viewerCount: number;
  duration: string;
  category: string;
  creator: string;
};

export const fallbackContent: MediaContent[] = [
  { id: "reef", title: "Beneath the Blue: 3,000m Below", description: "Dive into a living world of coral, light, and deep ocean calm.", type: "LIVE_360", mediaUrl: null, pricePoints: 0, isLive: true, viewerCount: 1240, duration: "LIVE", category: "NATURE", creator: "HOMINSU ORIGINALS" },
  { id: "iss", title: "ISS: A Window Above Earth", description: "Float above the planet and watch the sunrise from orbit.", type: "LIVE_360", mediaUrl: null, pricePoints: 0, isLive: true, viewerCount: 842, duration: "LIVE", category: "SPACE", creator: "HOMINSU ORIGINALS" },
  { id: "cyber", title: "Seoul After Dark: Cyber Pulse", description: "A neon-night walk through the city that never powers down.", type: "LIVE_360", mediaUrl: null, pricePoints: 100, isLive: true, viewerCount: 2148, duration: "02:59", category: "CITY", creator: "MIRA KIM" },
  { id: "alps", title: "Alps in 360: Above the Clouds", description: "A quiet flight through snow peaks and blue mountain air.", type: "LIVE_360", mediaUrl: null, pricePoints: 100, isLive: true, viewerCount: 412, duration: "08:42", category: "TRAVEL", creator: "NORTH FACE VR" },
  { id: "seoul", title: "Seoul 2088: A Future City", description: "A cinematic 360 journey through a city imagined tomorrow.", type: "VOD", mediaUrl: null, pricePoints: 100, isLive: false, viewerCount: 0, duration: "12:18", category: "ORIGINAL", creator: "HOMINSU ORIGINALS" },
  { id: "aurora", title: "Aurora Camp: Northern Lights", description: "Sit beside the fire while the sky moves in green and violet.", type: "VOD", mediaUrl: null, pricePoints: 150, isLive: false, viewerCount: 0, duration: "06:10", category: "NATURE", creator: "POLARIS STUDIO" },
];

export function normalizeContent(raw: Record<string, unknown>): MediaContent {
  const value = (keys: string[], fallback: unknown) => keys.map((key) => raw[key]).find((item) => item !== undefined) ?? fallback;
  return {
    id: String(value(["id", "content_id"], `content-${Date.now()}`)),
    title: String(value(["title", "name"], "Untitled VR experience")),
    description: String(value(["description", "summary"], "Immersive 360 content from HOMINSU.")),
    type: String(value(["type", "content_type"], "VOD")).toUpperCase() as ContentType,
    mediaUrl: value(["mediaUrl", "media_url", "video_url", "stream_url"], null) as string | null,
    posterUrl: value(["posterUrl", "poster_url", "thumbnail_url"], null) as string | null,
    pricePoints: Number(value(["pricePoints", "price_points", "price"], 0)),
    isLive: Boolean(value(["isLive", "is_live"], false)),
    viewerCount: Number(value(["viewerCount", "viewer_count"], 0)),
    duration: String(value(["duration", "duration_label"], "03:00")),
    category: String(value(["category", "tag"], "VR360")),
    creator: String(value(["creator", "author"], "HOMINSU ORIGINALS")),
  };
}
