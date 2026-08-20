"use client";

import { useCallback, useEffect, useRef } from "react";
import { normalizeSnapshot, useFleetStore } from "@/store/useFleetStore";
import type { DevicePatch, FleetServerMessage, SyncPlayCommand } from "@/types/fleet";

const DEFAULT_URL = "ws://localhost:8000/ws/operator";
const asObject = (value: unknown) => value && typeof value === "object" ? value as Record<string, unknown> : null;
const asString = (value: unknown) => typeof value === "string" && value.length > 0 ? value : null;

const telemetryPatch = (id: string, raw: Record<string, unknown>): DevicePatch => {
  const patch: DevicePatch["patch"] = { updatedAt: String(raw.updatedAt ?? raw.updated_at ?? new Date().toISOString()) };
  const battery = raw.batteryLevel ?? raw.battery_level;
  if (battery !== undefined) patch.batteryLevel = Number(battery);
  if (typeof raw.status === "string") patch.status = raw.status.toUpperCase() as DevicePatch["patch"]["status"];
  const fields: Array<[keyof DevicePatch["patch"], string, string]> = [
    ["ipAddress", "ipAddress", "ip_address"], ["name", "name", "device_name"], ["model", "model", "device_model"],
    ["group", "group", "group_name"], ["osVersion", "osVersion", "os_version"], ["firmwareVersion", "firmwareVersion", "firmware_version"],
  ];
  for (const [target, camel, snake] of fields) if (raw[camel] !== undefined || raw[snake] !== undefined) patch[target] = String(raw[camel] ?? raw[snake]);
  const title = raw.currentVideoTitle ?? raw.current_video_title;
  if (title !== undefined) patch.currentVideoTitle = title == null ? null : String(title);
  const url = raw.currentVideoUrl ?? raw.current_video_url;
  if (url !== undefined) patch.currentVideoUrl = url == null ? null : String(url);
  const lastSeen = raw.lastSeenAt ?? raw.last_seen_at;
  if (lastSeen !== undefined) patch.lastSeenAt = String(lastSeen);
  return { id, patch };
};

const makeCommandId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `sync-${Date.now()}`;

export function useFleetWebSocket(options: { url?: string; reconnect?: boolean } = {}) {
  const url = options.url ?? (process.env.NEXT_PUBLIC_WS_URL ? `${process.env.NEXT_PUBLIC_WS_URL}/ws/operator` : DEFAULT_URL);
  const shouldReconnect = options.reconnect ?? true;
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const attempt = useRef(0);
  const mounted = useRef(false);
  const connectRef = useRef<() => void>(() => undefined);
  const patches = useRef(new Map<string, DevicePatch["patch"]>());

  const patchDevices = useFleetStore((state) => state.patchDevices);
  const hydrate = useFleetStore((state) => state.hydrate);
  const setConnectionState = useFleetStore((state) => state.setConnectionState);
  const setError = useFleetStore((state) => state.setError);
  const setCommandState = useFleetStore((state) => state.setCommandState);

  const flush = useCallback(() => {
    frame.current = null;
    if (!patches.current.size) return;
    const next: DevicePatch[] = [...patches.current.entries()].map(([id, patch]) => ({ id, patch }));
    patches.current.clear();
    patchDevices(next);
  }, [patchDevices]);

  const queue = useCallback((items: DevicePatch[]) => {
    for (const { id, patch } of items) patches.current.set(id, { ...patches.current.get(id), ...patch });
    if (frame.current === null) frame.current = window.requestAnimationFrame(flush);
  }, [flush]);

  const handleMessage = useCallback((message: FleetServerMessage) => {
    if (message.type === "SNAPSHOT") {
      const devices = normalizeSnapshot(message.devices);
      if (devices.length) hydrate(devices);
      return;
    }
    if (message.type === "TELEMETRY") {
      const id = asString(message.deviceId ?? message.device_id);
      if (id) queue([telemetryPatch(id, { ...(message.device ?? {}), ...(message.payload ?? {}) })]);
      return;
    }
    const id = asString(message.commandId ?? message.command_id);
    if (!id) return;
    if (message.type === "COMMAND_ACK") {
      setCommandState(id, message.accepted ? "accepted" : "failed");
      if (!message.accepted) setError(message.message ?? "Command rejected");
    } else if (message.type === "COMMAND_ERROR") {
      setCommandState(id, "failed");
      setError(message.message ?? "Command failed");
    }
  }, [hydrate, queue, setCommandState, setError]);

  const connect = useCallback(() => {
    if (!mounted.current || socketRef.current?.readyState === WebSocket.OPEN) return;
    setConnectionState(attempt.current ? "reconnecting" : "connecting");
    let socket: WebSocket;
    try { socket = new WebSocket(url); } catch { setConnectionState("error"); return; }
    socketRef.current = socket;
    socket.onopen = () => { attempt.current = 0; setConnectionState("connected"); setError(null); };
    socket.onmessage = (event) => {
      try {
        const message = asObject(JSON.parse(String(event.data))) as FleetServerMessage | null;
        if (message?.type) handleMessage(message);
      } catch { setError("Received an invalid fleet message"); }
    };
    socket.onerror = () => setConnectionState("error");
    socket.onclose = () => {
      socketRef.current = null;
      if (!mounted.current || !shouldReconnect) { setConnectionState("closed"); return; }
      const delay = Math.min(30000, 1000 * 2 ** attempt.current) + Math.floor(Math.random() * 500);
      attempt.current += 1;
      setConnectionState("reconnecting");
      reconnectTimer.current = window.setTimeout(() => connectRef.current(), delay);
    };
  }, [handleMessage, setConnectionState, setError, shouldReconnect, url]);

  useEffect(() => {
    mounted.current = true;
    connectRef.current = connect;
    connect();
    return () => {
      mounted.current = false;
      connectRef.current = () => undefined;
      if (reconnectTimer.current !== null) window.clearTimeout(reconnectTimer.current);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      patches.current.clear();
      socketRef.current?.close(1000, "operator route closed");
      socketRef.current = null;
    };
  }, [connect]);

  const send = useCallback((message: unknown) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) { setError("Fleet socket is not connected"); return false; }
    socketRef.current.send(JSON.stringify(message));
    return true;
  }, [setError]);

  const sendSyncPlay = useCallback((videoUrl: string, targetDeviceIds: string[], positionSeconds = 0) => {
    const command: SyncPlayCommand = { type: "SYNC_PLAY", commandId: makeCommandId(), videoUrl, targetDeviceIds, positionSeconds, startAtMs: Date.now() + 1500 };
    const sent = send(command);
    if (sent) setCommandState(command.commandId, "pending");
    return sent ? command.commandId : null;
  }, [send, setCommandState]);

  return { connectionState: useFleetStore((state) => state.connectionState), send, sendSyncPlay, reconnect: connect };
}
