"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import * as THREE from "three";
import { Maximize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

type XrSessionLike = { addEventListener: (name: string, listener: () => void) => void; end: () => Promise<void> };
type XrSystemLike = { isSessionSupported: (mode: string) => Promise<boolean>; requestSession: (mode: string, options?: Record<string, unknown>) => Promise<unknown> };
type Props = { src: string; previewSeconds?: number; locked?: boolean; onPreviewExpired?: () => void };

export default function VR360Player({ src, previewSeconds = 15, locked = false, onPreviewExpired }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const xrSessionRef = useRef<XrSessionLike | null>(null);
  const previewNotified = useRef(false);
  const [webglFallback, setWebglFallback] = useState(false);
  const [xrReady, setXrReady] = useState(false);
  const [inVr, setInVr] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setStorePlaying = usePlayerStore((state) => state.setPlaying);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setStoreMuted = usePlayerStore((state) => state.setMuted);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || locked) return;
    try {
      if (video.paused) await video.play(); else video.pause();
    } catch { setError("Press play to start the stream."); }
  }, [locked]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    setStoreMuted(video.muted);
  }, [setStoreMuted]);

  const enterVr = useCallback(async () => {
    const xr = (navigator as Navigator & { xr?: XrSystemLike }).xr;
    const renderer = rendererRef.current;
    if (!xr || !renderer) return;
    try {
      const session = await xr.requestSession("immersive-vr", { requiredFeatures: ["local-floor"] });
      const typedSession = session as XrSessionLike;
      xrSessionRef.current = typedSession;
      typedSession.addEventListener("end", () => { setInVr(false); xrSessionRef.current = null; });
      await renderer.xr.setSession(session as XRSession);
      setInVr(true);
    } catch { setError("VR mode is unavailable on this device."); }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    const video = videoRef.current;
    if (!mount || !video) return;
    let hls: Hls | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let texture: THREE.VideoTexture | null = null;
    let geometry: THREE.SphereGeometry | null = null;
    let material: THREE.MeshBasicMaterial | null = null;
    let rendererCleanup: (() => void) | null = null;
    let fallbackTimer: number | null = null;
    let disposed = false;
    let yaw = 0;
    let pitch = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onTime = () => {
      setProgress(video.currentTime, Number.isFinite(video.duration) ? video.duration : 0);
      if (!previewNotified.current && previewSeconds > 0 && video.currentTime >= previewSeconds) {
        previewNotified.current = true;
        video.pause();
        onPreviewExpired?.();
      }
    };
    const onPlay = () => { setPlaying(true); setStorePlaying(true); };
    const onPause = () => { setPlaying(false); setStorePlaying(false); };
    const onError = () => setError("The stream could not be loaded. Check the HLS origin and CORS settings.");
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    video.muted = true;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 30 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) setError("The live stream is temporarily unavailable."); });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      setError("This browser cannot play HLS video.");
    }

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.xr.enabled = true;
      renderer.domElement.className = "player-canvas";
      mount.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 1100);
      camera.position.set(0, 0, 0.01);
      camera.rotation.order = "YXZ";
      texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      geometry = new THREE.SphereGeometry(100, 64, 40);
      geometry.scale(-1, 1, 1);
      material = new THREE.MeshBasicMaterial({ map: texture });
      scene.add(new THREE.Mesh(geometry, material));
      const render = () => { if (!disposed && renderer) renderer.render(scene, camera); };
      renderer.setAnimationLoop(render);
      const rotate = () => { camera.rotation.set(pitch, yaw, 0); };
      const pointerDown = (event: PointerEvent) => { if (renderer?.xr.isPresenting) return; dragging = true; lastX = event.clientX; lastY = event.clientY; renderer?.domElement.setPointerCapture(event.pointerId); };
      const pointerMove = (event: PointerEvent) => { if (!dragging) return; yaw -= (event.clientX - lastX) * 0.004; pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch - (event.clientY - lastY) * 0.004)); lastX = event.clientX; lastY = event.clientY; rotate(); };
      const pointerUp = () => { dragging = false; };
      const resize = () => { if (!renderer) return; camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight); camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); };
      renderer.domElement.addEventListener("pointerdown", pointerDown);
      renderer.domElement.addEventListener("pointermove", pointerMove);
      renderer.domElement.addEventListener("pointerup", pointerUp);
      renderer.domElement.addEventListener("pointercancel", pointerUp);
      window.addEventListener("resize", resize);
      const xr = (navigator as Navigator & { xr?: XrSystemLike }).xr;
      if (xr) xr.isSessionSupported("immersive-vr").then(setXrReady).catch(() => setXrReady(false));

      rendererCleanup = () => {
        disposed = true;
        window.removeEventListener("resize", resize);
        renderer?.domElement.removeEventListener("pointerdown", pointerDown);
        renderer?.domElement.removeEventListener("pointermove", pointerMove);
        renderer?.domElement.removeEventListener("pointerup", pointerUp);
        renderer?.domElement.removeEventListener("pointercancel", pointerUp);
        renderer?.setAnimationLoop(null);
        renderer?.dispose();
        texture?.dispose(); geometry?.dispose(); material?.dispose();
        rendererRef.current = null;
      };
    } catch {
      fallbackTimer = window.setTimeout(() => setWebglFallback(true), 0);
    }

    return () => {
      rendererCleanup?.();
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
    };
  }, [onPreviewExpired, previewSeconds, setProgress, setStorePlaying, src]);

  useEffect(() => () => { void xrSessionRef.current?.end(); }, []);

  return <div className="player-frame">
    <div ref={mountRef} className={webglFallback ? "player-stage fallback" : "player-stage"}>
      <video ref={videoRef} className={webglFallback ? "native-player" : "native-player visually-hidden"} playsInline muted controls={webglFallback} preload="metadata" />
      {!webglFallback && <div className="player-hint">Drag to look around · {xrReady ? "VR ready" : "360 view"}</div>}
    </div>
    <div className="player-toolbar"><button type="button" className="player-control" onClick={togglePlay} disabled={locked} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}</button><button type="button" className="player-control" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button><span className="player-toolbar-spacer" />{xrReady && <button type="button" className="player-vr-button" onClick={enterVr} disabled={inVr}>{inVr ? "IN VR" : "ENTER VR"}</button>}<button type="button" className="player-control" onClick={() => document.querySelector(".player-frame")?.requestFullscreen()} aria-label="Fullscreen"><Maximize size={18} /></button></div>
    {error && <p className="player-error"><RotateCcw size={14} />{error}</p>}
  </div>;
}
