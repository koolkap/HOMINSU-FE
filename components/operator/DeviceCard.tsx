"use client";

import { Battery, Check, CircleAlert, Wifi } from "lucide-react";
import { useFleetStore } from "@/store/useFleetStore";
import type { DeviceStatus } from "@/types/fleet";

const labels: Record<DeviceStatus, string> = { ONLINE: "ONLINE", OFFLINE: "OFFLINE", UPDATING: "UPDATING", LOW_BATTERY: "LOW BATTERY", UNKNOWN: "UNKNOWN" };
const statusClass: Record<DeviceStatus, string> = { ONLINE: "device-online", OFFLINE: "device-offline", UPDATING: "device-updating", LOW_BATTERY: "device-low", UNKNOWN: "device-unknown" };

export default function DeviceCard({ deviceId }: { deviceId: string }) {
  const device = useFleetStore((state) => state.devicesById[deviceId]);
  const selected = useFleetStore((state) => state.selectedDeviceIds.includes(deviceId));
  const toggle = useFleetStore((state) => state.toggleDevice);
  if (!device) return null;
  const batteryTone = device.batteryLevel <= 20 ? "battery-red" : device.batteryLevel <= 40 ? "battery-yellow" : "battery-green";
  return <article className={selected ? "device-card selected" : "device-card"}><div className="device-card-top"><button type="button" className="device-check" onClick={() => toggle(device.id)} aria-pressed={selected} aria-label={`Select ${device.id}`}>{selected && <Check size={15} />}</button><span className={`device-status ${statusClass[device.status]}`}>{labels[device.status]}</span></div><div className="device-name-row"><Wifi size={20} className={device.status === "ONLINE" ? "device-wifi online" : "device-wifi"} /><div><h3>{device.id}</h3><p>{device.model} · {device.group}</p></div></div><div className="device-metrics"><span><Battery size={15} />{device.batteryLevel}%</span><span>{device.osVersion}</span><code>{device.ipAddress}</code></div><div className="battery-track"><div className={batteryTone} style={{ width: `${device.batteryLevel}%` }} /></div><div className="device-current">{device.status === "LOW_BATTERY" && <CircleAlert size={14} />}{device.currentVideoTitle ?? "No content currently playing"}<time>{device.updatedAt ? new Date(device.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</time></div></article>;
}
