import { create } from "zustand";
import type { DevicePatch, DeviceStatus, FleetConnectionState, FleetDevice } from "@/types/fleet";

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
  setError: (error: string | null) => void;
  setCommandState: (commandId: string, state: "pending" | "accepted" | "failed") => void;
};

const initialDeviceSeed: Array<[string, string, string, string, number, DeviceStatus, string]> = [
  ["HS-01", "Quest Pro", "Studio A", "10.0.15.52", 75, "ONLINE", "v2.4.0"],
  ["HS-02", "Quest 3", "Studio A", "10.0.15.53", 82, "ONLINE", "v2.4.0"],
  ["HS-03", "Quest Pro", "Studio A", "10.0.15.54", 45, "ONLINE", "v2.4.0"],
  ["HS-04", "Quest 2", "Studio B", "10.0.15.55", 18, "LOW_BATTERY", "v2.3.8"],
  ["HS-05", "Quest Pro", "Studio B", "10.0.15.56", 92, "ONLINE", "v2.4.0"],
  ["HS-06", "Quest 2", "Studio B", "10.0.15.57", 12, "LOW_BATTERY", "v2.3.8"],
  ["HS-07", "Quest 3", "Studio C", "10.0.15.58", 65, "UPDATING", "v2.3.8"],
  ["HS-08", "Quest Pro", "Studio C", "10.0.15.59", 0, "OFFLINE", "v2.4.0"],
  ["HS-09", "Quest 3", "Studio C", "10.0.15.60", 55, "ONLINE", "v2.4.0"],
  ["HS-10", "Quest 2", "Studio C", "10.0.15.61", 38, "UPDATING", "v2.3.8"],
  ["HS-11", "Quest Pro", "Studio D", "10.0.15.62", 88, "ONLINE", "v2.4.0"],
  ["HS-12", "Quest 3", "Studio D", "10.0.15.63", 71, "ONLINE", "v2.4.0"],
];

const initialDevices: FleetDevice[] = initialDeviceSeed.map(([id, model, group, ipAddress, batteryLevel, status, firmwareVersion]) => ({
  id, name: `Headset ${id.slice(-2)}`, model, group, ipAddress, osVersion: firmwareVersion, firmwareVersion,
  batteryLevel, status: status as DeviceStatus, currentVideoTitle: null, currentVideoUrl: null,
  lastSeenAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}));

const byId = (devices: FleetDevice[]) => devices.reduce<Record<string, FleetDevice>>((result, device) => {
  result[device.id] = device;
  return result;
}, {});

const clampBattery = (value: unknown) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 0;
};

export const useFleetStore = create<FleetState>((set) => ({
  devicesById: byId(initialDevices), deviceOrder: initialDevices.map((device) => device.id), selectedDeviceIds: [],
  syncVideoUrl: process.env.NEXT_PUBLIC_LIVE_HLS_URL ?? "http://localhost:8080/live/stream.m3u8",
  connectionState: "idle", lastError: null, pendingCommands: {},
  hydrate: (devices) => set((state) => {
    const next = byId(devices);
    return { devicesById: next, deviceOrder: devices.map((device) => device.id), selectedDeviceIds: state.selectedDeviceIds.filter((id) => Boolean(next[id])) };
  }),
  patchDevices: (patches) => set((state) => {
    const nextDevices = { ...state.devicesById };
    let changed = false;
    for (const { id, patch } of patches) {
      const current = nextDevices[id];
      if (!current) continue;
      const next = { ...current, ...patch, batteryLevel: patch.batteryLevel === undefined ? current.batteryLevel : clampBattery(patch.batteryLevel), updatedAt: patch.updatedAt ?? new Date().toISOString() };
      if (Object.keys(next).some((key) => next[key as keyof FleetDevice] !== current[key as keyof FleetDevice])) {
        nextDevices[id] = next;
        changed = true;
      }
    }
    return changed ? { devicesById: nextDevices } : state;
  }),
  toggleDevice: (id) => set((state) => ({ selectedDeviceIds: state.selectedDeviceIds.includes(id) ? state.selectedDeviceIds.filter((selectedId) => selectedId !== id) : [...state.selectedDeviceIds, id] })),
  selectOnline: () => set((state) => ({ selectedDeviceIds: state.deviceOrder.filter((id) => state.devicesById[id]?.status === "ONLINE") })),
  clearSelection: () => set({ selectedDeviceIds: [] }),
  setSyncVideoUrl: (syncVideoUrl) => set({ syncVideoUrl }),
  setConnectionState: (connectionState) => set({ connectionState }),
  setError: (lastError) => set({ lastError }),
  setCommandState: (commandId, commandState) => set((state) => ({ pendingCommands: { ...state.pendingCommands, [commandId]: commandState } })),
}));

export const normalizeDevice = (raw: Record<string, unknown>, fallbackId?: string): FleetDevice => {
  const get = (camel: string, snake: string, fallback: unknown) => raw[camel] ?? raw[snake] ?? fallback;
  const now = new Date().toISOString();
  const id = String(get("id", "device_id", fallbackId ?? ""));
  return {
    id, name: String(get("name", "device_name", id)), model: String(get("model", "device_model", "Unknown")),
    group: String(get("group", "group_name", "Unassigned")), ipAddress: String(get("ipAddress", "ip_address", "Unknown")),
    osVersion: String(get("osVersion", "os_version", get("firmware", "firmware_version", "Unknown"))),
    firmwareVersion: String(get("firmwareVersion", "firmware_version", get("firmware", "firmware", "Unknown"))),
    batteryLevel: clampBattery(get("batteryLevel", "battery_level", 0)), status: String(raw.status ?? "UNKNOWN").toUpperCase() as DeviceStatus,
    currentVideoTitle: raw.currentVideoTitle == null && raw.current_video_title == null ? null : String(raw.currentVideoTitle ?? raw.current_video_title),
    currentVideoUrl: raw.currentVideoUrl == null && raw.current_video_url == null ? null : String(raw.currentVideoUrl ?? raw.current_video_url),
    lastSeenAt: String(get("lastSeenAt", "last_seen_at", now)), updatedAt: String(get("updatedAt", "updated_at", now)),
  };
};

export const normalizeSnapshot = (rawDevices: unknown[]) => rawDevices.filter((device): device is Record<string, unknown> => Boolean(device) && typeof device === "object").map((device) => normalizeDevice(device));
