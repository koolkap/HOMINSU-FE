"use client";

import { RefreshCcw, Search, ServerCog, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import DeviceCard from "@/components/operator/DeviceCard";
import OperatorSummary from "@/components/operator/OperatorSummary";
import SyncPlayBar from "@/components/operator/SyncPlayBar";
import { useFleetStore } from "@/store/useFleetStore";
import { useFleetWebSocket } from "@/lib/useFleetWebSocket";

export default function OperatorConsole() {
  const order = useFleetStore((state) => state.deviceOrder);
  const devices = useFleetStore((state) => state.devicesById);
  const selected = useFleetStore((state) => state.selectedDeviceIds);
  const selectOnline = useFleetStore((state) => state.selectOnline);
  const clearSelection = useFleetStore((state) => state.clearSelection);
  const connection = useFleetStore((state) => state.connectionState);
  const [query, setQuery] = useState("");
  const { reconnect, sendSyncPlay } = useFleetWebSocket();
  const visible = useMemo(() => order.filter((id) => {
    const device = devices[id];
    const text = `${device?.id} ${device?.name} ${device?.model} ${device?.ipAddress}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }), [devices, order, query]);
  const allSelected = selected.length > 0 && selected.length === order.length;
  return <main className="operator-page"><div className="operator-shell"><div className="operator-heading"><div><p className="eyebrow"><ServerCog size={15} />OPERATOR CONSOLE</p><h1>Fleet control<br /><em>at a glance.</em></h1><p>Monitor headset health, push firmware, and coordinate synchronized playback.</p></div><OperatorSummary /></div><SyncPlayBar connectionState={connection} sendSyncPlay={sendSyncPlay} /><div className="fleet-toolbar"><div className="toolbar-left"><button className="toolbar-button" type="button" onClick={() => allSelected ? clearSelection() : selectOnline()}>{allSelected ? "Clear selection" : "Select online"} <span>{selected.length}/{order.length}</span></button><label className="operator-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, model, or IP" /></label><button className="toolbar-button" type="button"><SlidersHorizontal size={15} />All devices</button></div><div className="toolbar-right"><span>socket: <strong>{connection}</strong></span><button className="toolbar-button" type="button" onClick={reconnect}><RefreshCcw size={15} />Reconnect</button></div></div><div className="device-grid">{visible.map((id) => <DeviceCard key={id} deviceId={id} />)}</div>{visible.length === 0 && <div className="empty-state">No headsets match the current search.</div>}</div></main>;
}
