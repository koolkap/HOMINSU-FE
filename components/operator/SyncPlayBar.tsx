"use client";

import { CheckCircle2, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useFleetStore } from "@/store/useFleetStore";

export default function SyncPlayBar({ connectionState, sendSyncPlay }: { connectionState: string; sendSyncPlay: (videoUrl: string, targetDeviceIds: string[]) => string | null }) {
  const selected = useFleetStore((state) => state.selectedDeviceIds);
  const videoUrl = useFleetStore((state) => state.syncVideoUrl);
  const setVideoUrl = useFleetStore((state) => state.setSyncVideoUrl);
  const error = useFleetStore((state) => state.lastError);
  function play() { if (selected.length) sendSyncPlay(videoUrl, selected); }
  return <section className="sync-play-bar"><div className="sync-track-thumb card-reef"><span>LIVE 360</span></div><div className="sync-copy"><p className="eyebrow">CURRENT CONTENT</p><h2>Beneath the Blue</h2><span>VR360 · 02:59 · {selected.length} selected</span></div><div className="sync-controls"><button type="button" className="round-control" aria-label="Previous"><RotateCcw size={17} /></button><button type="button" className="sync-play-button" onClick={play} disabled={connectionState !== "connected" || selected.length === 0}><Play size={18} fill="currentColor" />SYNC PLAY</button><button type="button" className="round-control" aria-label="Pause"><Pause size={17} /></button><button type="button" className="round-control" aria-label="Volume"><Volume2 size={17} /></button></div><label className="sync-url"><span>Playback URL</span><input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} spellCheck={false} /></label><div className="sync-progress"><span /><div><small>00:00</small><small>02:59</small></div></div>{error && <p className="operator-error"><CheckCircle2 size={14} />{error}</p>}</section>;
}
