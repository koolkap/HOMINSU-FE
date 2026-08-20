"use client";

import { Bookmark, Heart, Share2 } from "lucide-react";
import { useState } from "react";

export default function PlayerActions() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return <div className="player-actions"><button type="button" onClick={() => setLiked(!liked)} className={liked ? "action-button selected" : "action-button"}><Heart size={17} fill={liked ? "currentColor" : "none"} />{liked ? "Liked" : "Like"}</button><button type="button" onClick={() => setSaved(!saved)} className={saved ? "action-button selected" : "action-button"}><Bookmark size={17} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button><button type="button" className="action-button"><Share2 size={17} />Share</button></div>;
}
