# Hominsu VR Studio Frontend Execution Guide

Production implementation plan for the Hominsu VR Studio consumer portal, 360-degree player, paywall, mobile surfaces, and operator fleet console.

## 0. What this guide targets

The repository currently contains:

- Next 16.3.1 with the App Router, React 19, TypeScript, and Tailwind CSS 4.
- Zustand, hls.js, video.js, and videojs-vr already installed.
- A first-pass fleet store in store/useFleetStore.ts.
- A first-pass WebSocket helper in lib/websocket.ts.
- Reference images under references/.

The requested Next.js 14+ App Router architecture is compatible with the current Next 16 setup. Keep the installed version unless the project has a hard deployment requirement for Next 14. If Next 14 is mandatory, pin Next 14 and React 18 together before implementation; do not mix the current React 19 package with Next 14.

The mockups use these visual directions:

- Operator/player shell: near-black surface, warm yellow controls, thin graphite borders, compact editorial typography.
- Consumer shell: dark navy surface, cyan primary actions, purple premium accents, wide cards and a persistent left rail on desktop.
- Mobile: edge-to-edge dark canvas, vertical content cards, 5-item bottom navigation, touch-sized controls.

The backend WebSocket payload shape is not present in the repository. The code below supports a documented canonical shape and accepts common snake_case/camelCase aliases at the edge. Once the backend schema is finalized, keep the normalizer as the only place that needs to change.

## 1. Architecture audit

### 1.1 Recommended rendering boundaries

Use Server Components for route shells, static metadata, and initial catalog/video data. Use Client Components only for:

- WebSocket connection and browser lifecycle.
- Zustand selectors.
- Device selection and command controls.
- HLS/WebGL/WebXR playback.
- Drag, touch, keyboard, and modal state.

This is important in the App Router: placing the client boundary on a route layout would pull the entire layout dependency tree into the client bundle. Keep app/layout.tsx, route pages, and static navigation server-rendered, then mount small client islands such as OperatorConsole, VR360Player, and PaywallOverlay.

### 1.2 Telemetry synchronization without jank

Do not replace the entire device array for every heartbeat. The safe update path is:

1. Parse a snapshot once on connect.
2. Normalize each telemetry event into an id plus patch.
3. Put patches in a Map keyed by device ID. If three messages arrive before the next paint, the last patch wins.
4. Flush the map once per animation frame with one Zustand action.
5. Keep the device order stable. Do not sort the grid on every update.
6. Subscribe each DeviceCard to its own device ID. A battery change on HS-02 should not re-render HS-01 or the toolbar.
7. Derive summary counts from a memoized selector or a low-frequency summary component.
8. Keep CSS transitions short and do not animate layout properties. Update the battery bar width only.

At the expected five-second heartbeat interval, this pattern is intentionally conservative and still handles a fleet that grows into the hundreds. It also protects the UI if a reconnect delivers a burst of queued telemetry.

Additional rules:

- Use device.id as the React key, never the array index.
- Treat last_seen_at as data. Mark a device stale only after a timeout; do not toggle OFFLINE on a single dropped message.
- Commands carry a client-generated command_id. Render pending/acknowledged/failed state from that ID.
- Reconnect with exponential backoff and jitter. Reset the backoff after a successful open.
- Close the socket and cancel timers on unmount. A route transition must not leave a reconnect loop alive.
- Avoid logging full telemetry payloads in production; device IPs and identifiers are operational data.

### 1.3 Paywall state machine

The preview timer, ad reward, point deduction, and content entitlement are separate states. Do not model them as four booleans.

~~~text
PREVIEW_PLAYING
      |
      | currentTime >= 15s or server preview token expires
      v
PREVIEW_EXPIRED
      |
      v
CHOICE
  |       |          |
  |       |          +--> CASH_CHECKOUT --> redirect to payment provider
  |       |
  |       +--------------> DEDUCTING --> DEDUCTED --> UNLOCKED
  |
  +----------------------> AD_COUNTDOWN --> CLAIMING_REWARD
                                      |
                                      +--> REWARD_ACCEPTED --> UNLOCKED
                                      +--> REWARD_REJECTED --> ERROR

Any network error returns to CHOICE with a retryable error.
UNLOCKED is terminal for this content session.
DISMISSED is a view state only; the server entitlement remains authoritative.
~~~

## 2. Operator console composition

### 5.1 Summary selector

Keep the summary row independent from the grid. It can re-render on each batch without forcing every card to render.

~~~tsx
// components/operator/OperatorSummary.tsx
"use client";

import { useMemo } from "react";
import { Activity, BatteryWarning, CheckCircle2, CloudCog, WifiOff } from "lucide-react";
import { useFleetStore } from "@/store/useFleetStore";

export default function OperatorSummary() {
  const devicesById = useFleetStore((state) => state.devicesById);
  const deviceOrder = useFleetStore((state) => state.deviceOrder);
  const connectionState = useFleetStore((state) => state.connectionState);

  const counts = useMemo(() => {
    return deviceOrder.reduce(
      (result, id) => {
        const status = devicesById[id]?.status;
        result.total += 1;
        if (status === "ONLINE") result.online += 1;
        if (status === "UPDATING") result.updating += 1;
        if (status === "LOW_BATTERY") result.lowBattery += 1;
        if (status === "OFFLINE") result.offline += 1;
        return result;
      },
      { total: 0, online: 0, updating: 0, lowBattery: 0, offline: 0 },
    );
  }, [deviceOrder, devicesById]);

  const items = [
    { label: "전체", value: counts.total, icon: Activity, tone: "bg-white text-black" },
    { label: "온라인", value: counts.online, icon: CheckCircle2, tone: "bg-accent-green text-black" },
    { label: "업데이트", value: counts.updating, icon: CloudCog, tone: "bg-accent-yellow text-black" },
    { label: "배터리 부족", value: counts.lowBattery, icon: BatteryWarning, tone: "bg-amber-400 text-black" },
    { label: "오프라인", value: counts.offline, icon: WifiOff, tone: "bg-slate-800 text-slate-300" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-strong">
        <span
          className={[
            "h-2 w-2 rounded-full",
            connectionState === "connected" ? "bg-accent-green" : "bg-accent-yellow",
          ].join(" ")}
        />
        {connectionState === "connected" ? "LIVE" : "연결 중"}
      </span>
      {items.map(({ label, value, icon: Icon, tone }) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-border px-2 py-1.5 text-sm text-muted-strong"
        >
          <span className={["grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-xs font-bold", tone].join(" ")}>
            {value}
          </span>
          <Icon size={15} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}
~~~

### 5.2 SyncPlayBar.tsx

The bar sends one scheduled command to the selected devices. The server should use startAtMs to schedule playback on each headset against the same clock.

~~~tsx
// components/operator/SyncPlayBar.tsx
"use client";

import { CheckCircle2, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useFleetStore } from "@/store/useFleetStore";
import { useFleetWebSocket } from "@/lib/useFleetWebSocket";

export default function SyncPlayBar() {
  const selectedDeviceIds = useFleetStore((state) => state.selectedDeviceIds);
  const videoUrl = useFleetStore((state) => state.syncVideoUrl);
  const setSyncVideoUrl = useFleetStore((state) => state.setSyncVideoUrl);
  const lastError = useFleetStore((state) => state.lastError);
  const { connectionState, sendSyncPlay } = useFleetWebSocket();

  const handleSyncPlay = () => {
    if (selectedDeviceIds.length === 0) return;
    sendSyncPlay(videoUrl, selectedDeviceIds, 0);
  };

  return (
    <section className="rounded-[20px] border border-border bg-[#0d0f14] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="h-20 w-32 shrink-0 rounded-2xl bg-[radial-gradient(circle_at_60%_35%,#f8cd70,#1b829e_50%,#0c2339)]" />
          <div className="min-w-0">
            <p className="text-sm text-muted">현재 콘텐츠</p>
            <h2 className="truncate text-2xl font-semibold">항공 우음도</h2>
            <p className="text-sm text-muted">VR360 · 100P · 2:59</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="focus-ring grid h-12 w-12 place-items-center rounded-full border border-border text-muted hover:text-foreground"
            aria-label="이전 콘텐츠"
          >
            <RotateCcw size={18} />
          </button>
          <button
            type="button"
            onClick={handleSyncPlay}
            disabled={connectionState !== "connected" || selectedDeviceIds.length === 0}
            className="focus-ring inline-flex h-14 items-center gap-3 rounded-full bg-[#f6c74a] px-7 font-bold text-black disabled:opacity-40"
          >
            <Play size={20} fill="currentColor" />
            SYNC PLAY
          </button>
          <button
            type="button"
            className="focus-ring grid h-12 w-12 place-items-center rounded-full border border-border text-muted hover:text-foreground"
            aria-label="다음 콘텐츠"
          >
            <Pause size={18} />
          </button>
          <button
            type="button"
            className="focus-ring grid h-12 w-12 place-items-center rounded-full border border-border text-muted hover:text-foreground"
            aria-label="볼륨"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      <label className="mt-6 block">
        <span className="mb-2 block text-xs text-muted">동기화 재생 URL</span>
        <input
          value={videoUrl}
          onChange={(event) => setSyncVideoUrl(event.target.value)}
          className="focus-ring w-full rounded-xl border border-border bg-[#11151d] px-4 py-3 font-mono text-xs text-muted-strong"
          spellCheck={false}
        />
      </label>

      <div className="mt-5 h-2 rounded-full bg-[#262a31]">
        <div className="h-2 w-1/12 rounded-full bg-[#f6c74a]" />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>00:00</span>
        <span>02:59</span>
      </div>

      {lastError ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-rose-300">
          <CheckCircle2 size={15} /> {lastError}
        </p>
      ) : null}
    </section>
  );
}
~~~

### 5.3 OperatorConsole.tsx

Use one WebSocket hook at the console boundary. Do not mount it once per card.

~~~tsx
// components/operator/OperatorConsole.tsx
"use client";

import { Search, ServerCog, SlidersHorizontal } from "lucide-react";
import DeviceCard from "@/components/operator/DeviceCard";
import OperatorSummary from "@/components/operator/OperatorSummary";
import SyncPlayBar from "@/components/operator/SyncPlayBar";
import { useFleetStore } from "@/store/useFleetStore";
import { useFleetWebSocket } from "@/lib/useFleetWebSocket";

export default function OperatorConsole() {
  const deviceOrder = useFleetStore((state) => state.deviceOrder);
  const selectedDeviceIds = useFleetStore((state) => state.selectedDeviceIds);
  const selectOnline = useFleetStore((state) => state.selectOnline);
  const clearSelection = useFleetStore((state) => state.clearSelection);
  const { connectionState, reconnect } = useFleetWebSocket();

  return (
    <main className="min-h-screen bg-operator px-6 py-10 text-foreground lg:px-12">
      <div className="mx-auto max-w-[2240px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted">
              <ServerCog size={16} /> Operator Console
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight lg:text-6xl">
              VR 헤드셋 원격 제어
            </h1>
            <p className="mt-3 text-muted-strong">
              하나의 콘솔에서 무제한 헤드셋을 동기화 재생 · 유지보수 · 모니터링하세요.
            </p>
          </div>
          <OperatorSummary />
        </div>

        <div className="mt-9">
          <SyncPlayBar />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-border bg-[#0c0e13] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                selectedDeviceIds.length === deviceOrder.length
                  ? clearSelection()
                  : selectOnline()
              }
              className="focus-ring rounded-full border border-border px-4 py-3 text-sm text-muted-strong hover:text-foreground"
            >
              전체 선택 ({selectedDeviceIds.length}/{deviceOrder.length})
            </button>
            <label className="flex items-center gap-3 rounded-full border border-border px-4 py-3 text-sm text-muted">
              <Search size={17} />
              <input
                placeholder="이름 / 모델 / IP"
                className="w-44 bg-transparent outline-none placeholder:text-muted"
              />
            </label>
            <button
              type="button"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-muted-strong"
            >
              전체 필터 <SlidersHorizontal size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>socket: {connectionState}</span>
            <button
              type="button"
              onClick={reconnect}
              className="focus-ring rounded-full border border-border px-4 py-3 hover:text-foreground"
            >
              재연결
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {deviceOrder.map((deviceId) => (
            <DeviceCard key={deviceId} deviceId={deviceId} />
          ))}
        </div>
      </div>
    </main>
  );
}
~~~

Operator route:

~~~tsx
// app/(operator)/operator/page.tsx
import type { Metadata } from "next";
import OperatorConsole from "@/components/operator/OperatorConsole";

export const metadata: Metadata = {
  title: "Operator Console",
};

export default function OperatorPage() {
  return <OperatorConsole />;
}
~~~

## 3. VR360Player.tsx

The component below renders an equirectangular HLS stream inside a Three.js sphere, supports mouse/touch drag, checks WebXR support, and falls back to native controls if WebGL cannot initialize. It is deliberately a client-only island.

~~~tsx
// components/player/VR360Player.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import * as THREE from "three";
import { Maximize, Play, Smartphone, RotateCcw } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

type XrSessionLike = {
  addEventListener: (name: string, listener: () => void) => void;
  end: () => Promise<void>;
};

type XrSystemLike = {
  isSessionSupported: (mode: string) => Promise<boolean>;
  requestSession: (mode: string, options?: Record<string, unknown>) => Promise<XrSessionLike>;
};

type VR360PlayerProps = {
  src?: string;
  previewSeconds?: number;
  locked?: boolean;
  onPreviewExpired?: () => void;
};

const HLS_MIME = "application/vnd.apple.mpegurl";

export default function VR360Player({
  src = process.env.NEXT_PUBLIC_LIVE_HLS_URL ??
    "http://localhost:8080/live/stream.m3u8",
  previewSeconds = Number(process.env.NEXT_PUBLIC_PREVIEW_SECONDS ?? 15),
  locked = false,
  onPreviewExpired,
}: VR360PlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const xrSessionRef = useRef<XrSessionLike | null>(null);
  const previewNotifiedRef = useRef(false);
  const [webglFallback, setWebglFallback] = useState(false);
  const [xrReady, setXrReady] = useState(false);
  const [inVr, setInVr] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPlaying = usePlayerStore((state) => state.setPlaying);

  useEffect(() => {
    const mount = mountRef.current;
    const video = videoRef.current;
    if (!mount || !video) return;

    let hls: Hls | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null = null;
    let texture: THREE.VideoTexture | null = null;
    let disposed = false;
    let yaw = 0;
    let pitch = 0;
    let dragging = false;
    let previousX = 0;
    let previousY = 0;

    const setCameraRotation = (camera: THREE.PerspectiveCamera) => {
      camera.rotation.order = "YXZ";
      camera.rotation.set(pitch, yaw, 0);
    };

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.xr.enabled = true;
      renderer.domElement.className = "absolute inset-0 h-full w-full touch-none";
      renderer.domElement.setAttribute("aria-label", "360도 VR 비디오 화면");
      mount.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        mount.clientWidth / Math.max(1, mount.clientHeight),
        0.1,
        1100,
      );
      camera.position.set(0, 0, 0.01);
      setCameraRotation(camera);

      texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const geometry = new THREE.SphereGeometry(100, 64, 40);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      const render = () => {
        if (!disposed && renderer) renderer.render(scene, camera);
      };
      renderer.setAnimationLoop(render);

      const resize = () => {
        if (!renderer) return;
        camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      };

      const pointerDown = (event: PointerEvent) => {
        if (renderer?.xr.isPresenting) return;
        dragging = true;
        previousX = event.clientX;
        previousY = event.clientY;
        renderer?.domElement.setPointerCapture(event.pointerId);
      };

      const pointerMove = (event: PointerEvent) => {
        if (!dragging || renderer?.xr.isPresenting) return;
        const deltaX = event.clientX - previousX;
        const deltaY = event.clientY - previousY;
        previousX = event.clientX;
        previousY = event.clientY;
        yaw -= deltaX * 0.004;
        pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch - deltaY * 0.004));
        setCameraRotation(camera);
      };

      const pointerUp = () => {
        dragging = false;
      };

      renderer.domElement.addEventListener("pointerdown", pointerDown);
      renderer.domElement.addEventListener("pointermove", pointerMove);
      renderer.domElement.addEventListener("pointerup", pointerUp);
      renderer.domElement.addEventListener("pointercancel", pointerUp);
      window.addEventListener("resize", resize);

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) setError("HLS 스트림을 불러오지 못했습니다.");
        });
      } else if (video.canPlayType(HLS_MIME)) {
        video.src = src;
      } else {
        setWebglFallback(true);
        setError("이 브라우저는 HLS 재생을 지원하지 않습니다.");
      }

      const timeUpdate = () => {
        if (
          !locked &&
          !previewNotifiedRef.current &&
          video.currentTime >= previewSeconds
        ) {
          previewNotifiedRef.current = true;
          video.pause();
          setIsPlaying(false);
          setPlaying(false);
          onPreviewExpired?.();
        }
      };
      video.addEventListener("timeupdate", timeUpdate);

      const navigatorWithXr = navigator as Navigator & { xr?: XrSystemLike };
      if (navigatorWithXr.xr) {
        navigatorWithXr.xr
          .isSessionSupported("immersive-vr")
          .then((supported) => {
            if (!disposed) setXrReady(supported);
          })
          .catch(() => setXrReady(false));
      }

      return () => {
        disposed = true;
        video.removeEventListener("timeupdate", timeUpdate);
        renderer?.domElement.removeEventListener("pointerdown", pointerDown);
        renderer?.domElement.removeEventListener("pointermove", pointerMove);
        renderer?.domElement.removeEventListener("pointerup", pointerUp);
        renderer?.domElement.removeEventListener("pointercancel", pointerUp);
        window.removeEventListener("resize", resize);
        renderer?.setAnimationLoop(null);
        hls?.destroy();
        texture?.dispose();
        sphere?.geometry.dispose();
        sphere?.material.dispose();
        renderer?.dispose();
        renderer?.domElement.remove();
        video.pause();
        video.removeAttribute("src");
        video.load();
        rendererRef.current = null;
        xrSessionRef.current = null;
      };
    } catch {
      setWebglFallback(true);
      setError("WebGL을 초기화하지 못했습니다. 일반 비디오로 전환합니다.");
    }
  }, [onPreviewExpired, previewSeconds, setPlaying, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (locked) {
      video.pause();
      setIsPlaying(false);
      setPlaying(false);
    }
  }, [locked, setPlaying]);

  const togglePlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || locked) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
        setPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
        setPlaying(false);
      }
    } catch {
      setError("재생을 시작하려면 화면을 한 번 눌러 주세요.");
    }
  }, [locked, setPlaying]);

  const enterVr = useCallback(async () => {
    const renderer = rendererRef.current;
    const navigatorWithXr = navigator as Navigator & { xr?: XrSystemLike };
    if (!renderer || !navigatorWithXr.xr || !xrReady) return;

    if (renderer.xr.isPresenting) {
      await xrSessionRef.current?.end();
      return;
    }

    try {
      const session = await navigatorWithXr.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor"],
      });
      await renderer.xr.setSession(
        session as unknown as Parameters<typeof renderer.xr.setSession>[0],
      );
      xrSessionRef.current = session;
      setInVr(true);
      session.addEventListener("end", () => {
        xrSessionRef.current = null;
        setInVr(false);
      });
    } catch {
      setError("VR 모드를 시작하지 못했습니다.");
    }
  }, [xrReady]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-black">
      <div ref={mountRef} className="absolute inset-0" />
      <video
        ref={videoRef}
        playsInline
        muted={locked}
        preload="metadata"
        crossOrigin="anonymous"
        controls={webglFallback}
        className={
          webglFallback
            ? "absolute inset-0 h-full w-full bg-black object-contain"
            : "pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
        }
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-5">
        <span className="rounded-full bg-black/70 px-4 py-2 text-sm text-white">
          {locked ? "🔒 프리뷰 15s" : "VR · 360° · 4K"}
        </span>
        {xrReady ? (
          <button
            type="button"
            onClick={enterVr}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-black"
          >
            <Smartphone size={16} />
            {inVr ? "VR 종료" : "Enter VR"}
          </button>
        ) : null}
      </div>

      {!webglFallback ? (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-16">
          <button
            type="button"
            onClick={togglePlayback}
            disabled={locked}
            className="focus-ring grid h-12 w-12 place-items-center rounded-full bg-white text-black disabled:opacity-50"
            aria-label={isPlaying ? "일시정지" : "재생"}
          >
            {isPlaying ? <RotateCcw size={18} /> : <Play size={20} fill="currentColor" />}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="focus-ring rounded-full border border-white/30 bg-black/30 p-3 text-white"
              aria-label="화면 확대"
            >
              <Maximize size={17} />
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="absolute inset-x-4 bottom-4 rounded-xl bg-black/80 px-4 py-3 text-center text-sm text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
~~~

The video element is hidden only when WebGL owns presentation. If WebGL fails, the same source becomes a normal accessible video player with browser controls.

Required invariants:

- The server must issue a preview-limited playback URL or entitlement. A client-only timer is not a security boundary.
- Seeking must be disabled while in preview mode, or the player must reject seeks beyond the preview cutoff.
- A point deduction must be atomic and idempotent. Send an idempotency key and unlock only after the server confirms the deduction.
- The ad countdown is only a UX clock. Credit points only after a provider/server callback has been verified.
- Disable the CTA while a transaction is in flight. The same click must not deduct twice.
- If the point API succeeds but the unlock request fails, refetch entitlement before showing an error. Do not charge again.
- When the point API returns the new balance, update the Zustand point store from that response.

### 1.4 360-degree/WebXR fallback

Use a single equirectangular video source and three presentation layers:

1. WebGL sphere with an HLS-backed video texture. Mouse and touch drag rotate the camera.
2. The same WebGL scene with renderer.xr.enabled = true and an immersive-vr session when navigator.xr supports it. Quest Browser must grant the session from a user gesture.
3. Native video controls when WebGL or HLS.js is unavailable.

Do not assume WebXR exists from the user agent string. Feature-detect navigator.xr, call isSessionSupported, and show an Enter VR control only after the promise resolves true. Do not autoplay with sound. playsInline, muted preview playback, and a clear play gesture are required on mobile and headsets.

HLS requirements:

- The HLS origin must send Access-Control-Allow-Origin for the portal origin and expose range requests.
- Configure the player for the stream's actual codec and segment duration.
- Prefer hls.js for MSE-capable browsers and native HLS only as a fallback.
- Destroy the HLS instance, WebGL renderer, texture, and event listeners when the component unmounts.

## 4. Project setup

### 2.1 Install or verify dependencies

Run from the repository root:

~~~powershell
npm install
npm install three @types/three
npx shadcn@latest init
~~~

When the shadcn initializer asks for options, use:

- TypeScript: yes
- Style: Default
- Base color: Slate
- CSS variables: yes
- Tailwind config: use the existing Tailwind 4 setup
- Import alias: @/*

Add the UI primitives used by this product:

~~~powershell
npx shadcn@latest add button badge dialog progress select tabs tooltip separator avatar
~~~

videojs-vr is already installed, but the reference implementation below uses hls.js plus three.js because it gives the application an explicit WebXR path. Keep videojs-vr available if a future player variant needs its legacy VR controls.

### 2.2 Environment variables

Create or update .env.local:

~~~dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_LIVE_HLS_URL=http://localhost:8080/live/stream.m3u8
NEXT_PUBLIC_PREVIEW_SECONDS=15
~~~

Only values prefixed with NEXT_PUBLIC_ are exposed to browser code. Never put a signing secret, payment secret, or server-to-server ad credential in this file.

### 2.3 Directory structure

Use route groups so the URL remains clean while the shells stay separated:

~~~text
app/
  layout.tsx
  globals.css
  (portal)/
    layout.tsx
    page.tsx
    watch/
      [id]/
        page.tsx
    shorts/
      page.tsx
    points/
      page.tsx
    profile/
      page.tsx
  (operator)/
    operator/
      page.tsx
  api/
    health/
      route.ts

components/
  layout/
    AppShell.tsx
    Sidebar.tsx
    MobileBottomNav.tsx
  operator/
    OperatorConsole.tsx
    DeviceCard.tsx
    OperatorSummary.tsx
    SyncPlayBar.tsx
  player/
    VR360Player.tsx
    VRWatchScreen.tsx
    PaywallOverlay.tsx
    PlayerActions.tsx
  portal/
    HeroCarousel.tsx
    ContentCard.tsx
    ShortsViewer.tsx
  ui/
    ...generated by shadcn...

lib/
  api.ts
  fleet-protocol.ts
  format.ts
  useFleetWebSocket.ts

store/
  useFleetStore.ts
  useAuthStore.ts
  usePlayerStore.ts

types/
  fleet.ts
  media.ts
~~~

The route mapping is:

| Screen | App Router file | URL |
| --- | --- | --- |
| Consumer landing / content | app/(portal)/page.tsx | / |
| 360 video detail/player | app/(portal)/watch/[id]/page.tsx | /watch/:id |
| Vertical VR shorts | app/(portal)/shorts/page.tsx | /shorts |
| Point recharge | app/(portal)/points/page.tsx | /points |
| Account/profile | app/(portal)/profile/page.tsx | /profile |
| Enterprise operator console | app/(operator)/operator/page.tsx | /operator |

### 2.4 App Router page boundaries

Root layout:

~~~tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HOMINSU VR STUDIO",
    template: "%s | HOMINSU VR STUDIO",
  },
  description: "360-degree VR live streams, VOD, shorts, and operator control.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
~~~

Portal layout:

~~~tsx
// app/(portal)/layout.tsx
import AppShell from "@/components/layout/AppShell";

export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
~~~

Watch route:

~~~tsx
// app/(portal)/watch/[id]/page.tsx
import type { Metadata } from "next";
import VRWatchScreen from "@/components/player/VRWatchScreen";

type WatchPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "VR 콘텐츠 " + id,
    description: "HOMINSU 360-degree VR content player",
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  return <VRWatchScreen contentId={id} />;
}
~~~

The local Next.js documentation uses Promise-based params in the current App Router type examples. Keep that shape for this repository's installed Next version. If the project is pinned to Next 14, use the corresponding Next 14 page prop type.

## 5. Tailwind design system

### 3.1 Tokens and global CSS

Replace the current global stylesheet with a tokenized dark system. This works with the repository's Tailwind 4 @import setup and exposes the tokens to utility classes.

~~~css
/* app/globals.css */
@import "tailwindcss";

:root {
  --background: #090a0f;
  --foreground: #f5f7fb;
  --surface: #10131a;
  --surface-elevated: #151922;
  --surface-hover: #1b2130;
  --border: #252b38;
  --border-strong: #343b4a;
  --muted: #8e96a5;
  --muted-strong: #b9c0cc;
  --purple: #8b5cf6;
  --purple-soft: #a78bfa;
  --yellow: #eab308;
  --yellow-bright: #f6c74a;
  --green: #22c55e;
  --red: #f43f5e;
  --cyan: #39c5f4;
  --navy: #071226;
  --portal-surface: #0b162d;
  --operator-surface: #090a0f;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-hover: var(--surface-hover);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-muted: var(--muted);
  --color-muted-strong: var(--muted-strong);
  --color-accent-purple: var(--purple);
  --color-accent-yellow: var(--yellow);
  --color-accent-green: var(--green);
  --color-accent-red: var(--red);
  --color-accent-cyan: var(--cyan);
  --color-portal: var(--portal-surface);
  --color-operator: var(--operator-surface);
}

* {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
  background: var(--background);
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(circle at 75% -5%, rgba(57, 197, 244, 0.08), transparent 25rem),
    var(--background);
  color: var(--foreground);
  font-family: Arial, "Noto Sans KR", sans-serif;
  text-rendering: optimizeLegibility;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

::selection {
  background: rgba(139, 92, 246, 0.4);
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #0b0d12;
}

::-webkit-scrollbar-thumb {
  border: 2px solid #0b0d12;
  border-radius: 999px;
  background: #343b4a;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5568;
}

.glass-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(
    145deg,
    rgba(20, 24, 34, 0.86),
    rgba(10, 12, 18, 0.76)
  );
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(18px);
}

.focus-ring {
  outline: none;
}

.focus-ring:focus-visible {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.45);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
~~~

### 3.2 Shell measurements

Desktop operator shell:

- Rail: 250px wide, #090a0f, one-pixel border.
- Top bar: 92px high, search field centered, yellow Join Pro action.
- Main max width: 2,240px, 32px to 64px page padding.
- Cards: 16px to 20px radius, one-pixel graphite border.
- Primary control: #f6c74a, black text, pill radius.

Desktop consumer shell:

- Rail: 248px wide, #071226.
- Header: 112px to 124px high.
- Main content: 64px to 80px top padding.
- Featured hero: 2-column grid on wide screens, 16:9 or 16:10 media.
- Premium selection: purple/cyan action, never red.

Mobile shell:

- Main content bottom padding must be at least 88px for the bottom navigation.
- Use a fixed five-item bottom nav: 홈, 숏폼, 검색, 라이브, MY.
- Content cards use 16:9 media and 12px to 16px gap.
- Point and profile screens use stacked cards with 16px page padding.

## 6. Shared protocol and Zustand state

### 4.1 Fleet types

~~~ts
// types/fleet.ts
export type DeviceStatus =
  | "ONLINE"
  | "OFFLINE"
  | "UPDATING"
  | "LOW_BATTERY"
  | "UNKNOWN";

export type FleetConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "closed"
  | "error";

export type FleetDevice = {
  id: string;
  name: string;
  model: string;
  group: string;
  ipAddress: string;
  osVersion: string;
  firmwareVersion: string;
  batteryLevel: number;
  status: DeviceStatus;
  currentVideoTitle: string | null;
  currentVideoUrl: string | null;
  lastSeenAt: string | null;
  updatedAt: string;
};

export type DevicePatch = {
  id: string;
  patch: Partial<FleetDevice>;
};

export type SyncPlayCommand = {
  type: "SYNC_PLAY";
  commandId: string;
  videoUrl: string;
  targetDeviceIds: string[];
  positionSeconds: number;
  startAtMs: number;
};

export type FleetServerMessage =
  | {
      type: "SNAPSHOT";
      devices: unknown[];
      sentAt?: string;
    }
  | {
      type: "TELEMETRY";
      deviceId?: string;
      device_id?: string;
      payload?: Record<string, unknown>;
      device?: Record<string, unknown>;
      sentAt?: string;
      sent_at?: string;
    }
  | {
      type: "COMMAND_ACK";
      commandId?: string;
      command_id?: string;
      accepted: boolean;
      message?: string;
    }
  | {
      type: "COMMAND_ERROR";
      commandId?: string;
      command_id?: string;
      message?: string;
    };
~~~

### 4.2 Fleet store optimized for partial updates

Normalize devices into a record so a card can subscribe to one record. Do not use a derived array as the canonical state.

~~~ts
// store/useFleetStore.ts
import { create } from "zustand";
import type {
  DevicePatch,
  FleetConnectionState,
  FleetDevice,
} from "@/types/fleet";

type FleetState = {
  devicesById: Record<string, FleetDevice>;
  deviceOrder: string[];
  selectedDeviceIds: string[];
  syncVideoUrl: string;
  connectionState: FleetConnectionState;
  lastError: string | null;
  pendingCommands: Record<string, "pending" | "accepted" | "failed">;
  hydrate: (devices: FleetDevice[]) => void;
  patchDevices: (patches: DevicePatch[]) => void;
  toggleDevice: (id: string) => void;
  selectOnline: () => void;
  clearSelection: () => void;
  setSyncVideoUrl: (url: string) => void;
  setConnectionState: (state: FleetConnectionState) => void;
  setError: (message: string | null) => void;
  setCommandState: (
    commandId: string,
    state: "pending" | "accepted" | "failed",
  ) => void;
};

const initialDevices: FleetDevice[] = [
  {
    id: "HS-01",
    name: "Headset 01",
    model: "Quest Pro",
    group: "Maintenance",
    ipAddress: "10.0.15.52",
    osVersion: "v2.4.0",
    firmwareVersion: "v2.4.0",
    batteryLevel: 75,
    status: "ONLINE",
    currentVideoTitle: "항공 우음도",
    currentVideoUrl: null,
    lastSeenAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "HS-02",
    name: "Headset 02",
    model: "Quest 3",
    group: "Maintenance",
    ipAddress: "10.0.15.53",
    osVersion: "v2.4.0",
    firmwareVersion: "v2.4.0",
    batteryLevel: 82,
    status: "ONLINE",
    currentVideoTitle: null,
    currentVideoUrl: null,
    lastSeenAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const byId = (devices: FleetDevice[]) =>
  devices.reduce<Record<string, FleetDevice>>((result, device) => {
    result[device.id] = device;
    return result;
  }, {});

const clampBattery = (value: unknown) => {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};

export const useFleetStore = create<FleetState>()((set) => ({
  devicesById: byId(initialDevices),
  deviceOrder: initialDevices.map((device) => device.id),
  selectedDeviceIds: [],
  syncVideoUrl:
    process.env.NEXT_PUBLIC_LIVE_HLS_URL ??
    "http://localhost:8080/live/stream.m3u8",
  connectionState: "idle",
  lastError: null,
  pendingCommands: {},

  hydrate: (devices) =>
    set({
      devicesById: byId(devices),
      deviceOrder: devices.map((device) => device.id),
    }),

  patchDevices: (patches) =>
    set((state) => {
      const nextDevices = { ...state.devicesById };
      let changed = false;

      for (const { id, patch } of patches) {
        const current = nextDevices[id];
        if (!current) continue;

        const next: FleetDevice = {
          ...current,
          ...patch,
          batteryLevel:
            patch.batteryLevel === undefined
              ? current.batteryLevel
              : clampBattery(patch.batteryLevel),
          updatedAt: patch.updatedAt ?? new Date().toISOString(),
        };

        const same = Object.keys(next).every(
          (key) =>
            next[key as keyof FleetDevice] ===
            current[key as keyof FleetDevice],
        );

        if (!same) {
          nextDevices[id] = next;
          changed = true;
        }
      }

      if (!changed) return state;
      return { devicesById: nextDevices };
    }),

  toggleDevice: (id) =>
    set((state) => ({
      selectedDeviceIds: state.selectedDeviceIds.includes(id)
        ? state.selectedDeviceIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedDeviceIds, id],
    })),

  selectOnline: () =>
    set((state) => ({
      selectedDeviceIds: state.deviceOrder.filter(
        (id) => state.devicesById[id]?.status === "ONLINE",
      ),
    })),

  clearSelection: () => set({ selectedDeviceIds: [] }),
  setSyncVideoUrl: (url) => set({ syncVideoUrl: url }),
  setConnectionState: (connectionState) => set({ connectionState }),
  setError: (lastError) => set({ lastError }),
  setCommandState: (commandId, commandState) =>
    set((state) => ({
      pendingCommands: {
        ...state.pendingCommands,
        [commandId]: commandState,
      },
    })),
}));

export const normalizeDevice = (
  raw: Record<string, unknown>,
  fallbackId?: string,
): FleetDevice => {
  const id = String(raw.id ?? raw.device_id ?? fallbackId ?? "");
  const now = new Date().toISOString();
  return {
    id,
    name: String(raw.name ?? raw.device_name ?? id),
    model: String(raw.model ?? raw.device_model ?? "Unknown"),
    group: String(raw.group ?? raw.group_name ?? "Unassigned"),
    ipAddress: String(raw.ipAddress ?? raw.ip_address ?? "—"),
    osVersion: String(raw.osVersion ?? raw.os_version ?? raw.firmware ?? "—"),
    firmwareVersion: String(
      raw.firmwareVersion ?? raw.firmware_version ?? raw.firmware ?? "—",
    ),
    batteryLevel: clampBattery(raw.batteryLevel ?? raw.battery_level),
    status: String(raw.status ?? "UNKNOWN").toUpperCase() as FleetDevice["status"],
    currentVideoTitle:
      raw.currentVideoTitle == null && raw.current_video_title == null
        ? null
        : String(raw.currentVideoTitle ?? raw.current_video_title),
    currentVideoUrl:
      raw.currentVideoUrl == null && raw.current_video_url == null
        ? null
        : String(raw.currentVideoUrl ?? raw.current_video_url),
    lastSeenAt: String(
      raw.lastSeenAt ?? raw.last_seen_at ?? raw.updatedAt ?? now,
    ),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? now),
  };
};

export const normalizeSnapshot = (rawDevices: unknown[]) =>
  rawDevices
    .filter(
      (device): device is Record<string, unknown> =>
        Boolean(device) && typeof device === "object",
    )
    .map((device) => normalizeDevice(device));
~~~

The local mock devices above are only for a usable empty-backend screen. Replace or hydrate them from the authenticated snapshot before exposing the operator console to production users.

### 4.3 useFleetWebSocket.ts

This hook owns the socket lifecycle, parses the supported server events, batches telemetry with requestAnimationFrame, and exposes a synchronized playback command.

~~~ts
// lib/useFleetWebSocket.ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  normalizeSnapshot,
  useFleetStore,
} from "@/store/useFleetStore";
import type {
  DevicePatch,
  FleetServerMessage,
  SyncPlayCommand,
} from "@/types/fleet";

type FleetWebSocketOptions = {
  url?: string;
  reconnect?: boolean;
};

const DEFAULT_URL = "ws://localhost:8000/ws/operator";

const asObject = (value: unknown): Record<string, unknown> | null =>
  Boolean(value) && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const makeCommandId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "sync-" + Date.now() + "-" + Math.random().toString(16).slice(2);
};

const toTelemetryPatch = (
  id: string,
  raw: Record<string, unknown>,
): DevicePatch => {
  const patch: DevicePatch["patch"] = {
    updatedAt: String(
      raw.updatedAt ??
        raw.updated_at ??
        raw.sentAt ??
        raw.sent_at ??
        new Date().toISOString(),
    ),
  };

  const battery = raw.batteryLevel ?? raw.battery_level;
  if (battery !== undefined) patch.batteryLevel = Number(battery);

  const status = raw.status;
  if (typeof status === "string") {
    patch.status = status.toUpperCase() as DevicePatch["patch"]["status"];
  }

  const ipAddress = raw.ipAddress ?? raw.ip_address;
  if (ipAddress !== undefined) patch.ipAddress = String(ipAddress);

  const model = raw.model ?? raw.device_model;
  if (model !== undefined) patch.model = String(model);

  const name = raw.name ?? raw.device_name;
  if (name !== undefined) patch.name = String(name);

  const group = raw.group ?? raw.group_name;
  if (group !== undefined) patch.group = String(group);

  const osVersion = raw.osVersion ?? raw.os_version;
  if (osVersion !== undefined) patch.osVersion = String(osVersion);

  const firmwareVersion =
    raw.firmwareVersion ?? raw.firmware_version ?? raw.firmware;
  if (firmwareVersion !== undefined) {
    patch.firmwareVersion = String(firmwareVersion);
  }

  const title = raw.currentVideoTitle ?? raw.current_video_title;
  if (title !== undefined) {
    patch.currentVideoTitle = title == null ? null : String(title);
  }

  const videoUrl = raw.currentVideoUrl ?? raw.current_video_url;
  if (videoUrl !== undefined) {
    patch.currentVideoUrl = videoUrl == null ? null : String(videoUrl);
  }

  const lastSeen = raw.lastSeenAt ?? raw.last_seen_at;
  if (lastSeen !== undefined) patch.lastSeenAt = String(lastSeen);

  return { id, patch };
};

const parseMessage = (value: unknown): FleetServerMessage | null => {
  const object = asObject(value);
  if (!object || typeof object.type !== "string") return null;
  return object as unknown as FleetServerMessage;
};

export function useFleetWebSocket(options: FleetWebSocketOptions = {}) {
  const configuredUrl =
    options.url ??
    (process.env.NEXT_PUBLIC_WS_URL
      ? process.env.NEXT_PUBLIC_WS_URL + "/ws/operator"
      : DEFAULT_URL);
  const shouldReconnect = options.reconnect ?? true;
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(false);
  const reconnectRef = useRef<() => void>(() => undefined);
  const pendingPatchesRef = useRef(new Map<string, DevicePatch["patch"]>());

  const patchDevices = useFleetStore((state) => state.patchDevices);
  const hydrate = useFleetStore((state) => state.hydrate);
  const setConnectionState = useFleetStore((state) => state.setConnectionState);
  const setError = useFleetStore((state) => state.setError);
  const setCommandState = useFleetStore((state) => state.setCommandState);

  const flushPatches = useCallback(() => {
    animationFrameRef.current = null;
    if (pendingPatchesRef.current.size === 0) return;

    const patches: DevicePatch[] = [];
    for (const [id, patch] of pendingPatchesRef.current) {
      patches.push({ id, patch });
    }
    pendingPatchesRef.current.clear();
    patchDevices(patches);
  }, [patchDevices]);

  const queuePatches = useCallback(
    (patches: DevicePatch[]) => {
      for (const { id, patch } of patches) {
        const previous = pendingPatchesRef.current.get(id);
        pendingPatchesRef.current.set(id, { ...previous, ...patch });
      }

      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(flushPatches);
      }
    },
    [flushPatches],
  );

  const handleMessage = useCallback(
    (message: FleetServerMessage) => {
      if (message.type === "SNAPSHOT") {
        const devices = normalizeSnapshot(message.devices);
        hydrate(devices);
        return;
      }

      if (message.type === "TELEMETRY") {
        const id = asString(message.deviceId ?? message.device_id);
        const raw = {
          ...(message.device ?? {}),
          ...(message.payload ?? {}),
        };
        if (id) queuePatches([toTelemetryPatch(id, raw)]);
        return;
      }

      const commandId = asString(message.commandId ?? message.command_id);
      if (!commandId) return;

      if (message.type === "COMMAND_ACK") {
        setCommandState(commandId, message.accepted ? "accepted" : "failed");
        if (!message.accepted) setError(message.message ?? "Command rejected");
      }

      if (message.type === "COMMAND_ERROR") {
        setCommandState(commandId, "failed");
        setError(message.message ?? "Command failed");
      }
    },
    [hydrate, queuePatches, setCommandState, setError],
  );

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionState(attemptRef.current === 0 ? "connecting" : "reconnecting");
    const socket = new WebSocket(configuredUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      attemptRef.current = 0;
      setConnectionState("connected");
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const message = parseMessage(JSON.parse(String(event.data)));
        if (message) handleMessage(message);
      } catch {
        setError("Received an invalid fleet message");
      }
    };

    socket.onerror = () => {
      setConnectionState("error");
    };

    socket.onclose = () => {
      socketRef.current = null;
      if (!mountedRef.current || !shouldReconnect) {
        setConnectionState("closed");
        return;
      }

      const exponential = Math.min(30000, 1000 * Math.pow(2, attemptRef.current));
      const jitter = Math.floor(Math.random() * 500);
      attemptRef.current += 1;
      setConnectionState("reconnecting");
      reconnectTimerRef.current = window.setTimeout(
        () => reconnectRef.current(),
        exponential + jitter,
      );
    };
  }, [
    configuredUrl,
    handleMessage,
    setConnectionState,
    setError,
    shouldReconnect,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    reconnectRef.current = connect;
    connect();

    return () => {
      mountedRef.current = false;
      reconnectRef.current = () => undefined;

      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      pendingPatchesRef.current.clear();
      socketRef.current?.close(1000, "operator route closed");
      socketRef.current = null;
    };
  }, [connect]);

  const send = useCallback(
    (message: unknown) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        setError("Fleet socket is not connected");
        return false;
      }
      socket.send(JSON.stringify(message));
      return true;
    },
    [setError],
  );

  const sendSyncPlay = useCallback(
    (videoUrl: string, targetDeviceIds: string[], positionSeconds = 0) => {
      const command: SyncPlayCommand = {
        type: "SYNC_PLAY",
        commandId: makeCommandId(),
        videoUrl,
        targetDeviceIds,
        positionSeconds,
        startAtMs: Date.now() + 1500,
      };

      const sent = send(command);
      if (sent) setCommandState(command.commandId, "pending");
      return sent ? command.commandId : null;
    },
    [send, setCommandState],
  );

  return {
    connectionState: useFleetStore((state) => state.connectionState),
    send,
    sendSyncPlay,
    reconnect: connect,
  };
}
~~~

If the backend requires an envelope like event plus data around SYNC_PLAY, change only the command object in sendSyncPlay and keep the public function stable.

### 4.4 DeviceCard.tsx

The card intentionally reads one device record and one selection value. That keeps the fleet grid stable during telemetry updates.

~~~tsx
// components/operator/DeviceCard.tsx
"use client";

import { Battery, Check, CircleAlert, Wifi } from "lucide-react";
import { useFleetStore } from "@/store/useFleetStore";
import type { DeviceStatus } from "@/types/fleet";

const statusLabel: Record<DeviceStatus, string> = {
  ONLINE: "온라인",
  OFFLINE: "오프라인",
  UPDATING: "업데이트",
  LOW_BATTERY: "배터리 부족",
  UNKNOWN: "확인 필요",
};

const statusClass: Record<DeviceStatus, string> = {
  ONLINE: "bg-accent-green text-black",
  OFFLINE: "bg-slate-800 text-slate-300",
  UPDATING: "bg-accent-yellow text-black",
  LOW_BATTERY: "bg-amber-400 text-black",
  UNKNOWN: "bg-slate-700 text-slate-200",
};

function batteryClass(level: number) {
  if (level <= 20) return "bg-accent-red";
  if (level <= 40) return "bg-accent-yellow";
  return "bg-accent-green";
}

export default function DeviceCard({ deviceId }: { deviceId: string }) {
  const device = useFleetStore((state) => state.devicesById[deviceId]);
  const selected = useFleetStore((state) =>
    state.selectedDeviceIds.includes(deviceId),
  );
  const toggleDevice = useFleetStore((state) => state.toggleDevice);

  if (!device) return null;

  return (
    <article
      className={[
        "rounded-[20px] border bg-[#0c0e13] p-6 transition-colors",
        selected
          ? "border-accent-yellow shadow-[0_0_0_1px_rgba(246,199,74,0.3)]"
          : "border-border hover:border-border-strong",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          aria-pressed={selected}
          aria-label={device.id + " 선택"}
          onClick={() => toggleDevice(device.id)}
          className="focus-ring grid h-7 w-7 place-items-center rounded-lg border border-border bg-[#11151d] text-muted hover:text-foreground"
        >
          {selected ? <Check size={16} className="text-accent-yellow" /> : null}
        </button>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-bold",
            statusClass[device.status],
          ].join(" ")}
        >
          {statusLabel[device.status]}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Wifi
          size={22}
          className={
            device.status === "ONLINE"
              ? "text-accent-green"
              : "text-muted"
          }
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold tracking-tight">
            {device.id}
          </h3>
          <p className="truncate text-sm text-muted">
            {device.model} · {device.group}
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-strong">
          <Battery size={17} aria-hidden="true" />
          <span>{device.batteryLevel}%</span>
        </div>
        <span className="truncate text-center text-muted">
          {device.osVersion}
        </span>
        <span className="truncate text-right font-mono text-xs text-muted">
          {device.ipAddress}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1d2027]">
        <div
          className={[
            "h-full rounded-full transition-[width] duration-300",
            batteryClass(device.batteryLevel),
          ].join(" ")}
          style={{ width: device.batteryLevel + "%" }}
          role="progressbar"
          aria-label={device.id + " 배터리"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={device.batteryLevel}
        />
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted">
        {device.status === "LOW_BATTERY" ? (
          <CircleAlert size={14} className="text-accent-yellow" />
        ) : null}
        <span className="truncate">
          {device.currentVideoTitle ?? "재생 중인 콘텐츠 없음"}
        </span>
      </div>
    </article>
  );
}
~~~
<!-- PAYWALL_SECTION_ANCHOR -->
