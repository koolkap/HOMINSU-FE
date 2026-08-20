"use client";

import { Activity, BatteryWarning, CheckCircle2, CloudCog, WifiOff } from "lucide-react";
import { useMemo } from "react";
import { useFleetStore } from "@/store/useFleetStore";

export default function OperatorSummary() {
  const devicesById = useFleetStore((state) => state.devicesById);
  const order = useFleetStore((state) => state.deviceOrder);
  const connection = useFleetStore((state) => state.connectionState);
  const counts = useMemo(() => order.reduce((result, id) => { const status = devicesById[id]?.status; result.total += 1; if (status === "ONLINE") result.online += 1; if (status === "UPDATING") result.updating += 1; if (status === "LOW_BATTERY") result.low += 1; if (status === "OFFLINE") result.offline += 1; return result; }, { total: 0, online: 0, updating: 0, low: 0, offline: 0 }), [devicesById, order]);
  const items = [["TOTAL", counts.total, Activity, "summary-white"], ["ONLINE", counts.online, CheckCircle2, "summary-green"], ["UPDATING", counts.updating, CloudCog, "summary-yellow"], ["LOW BATTERY", counts.low, BatteryWarning, "summary-amber"], ["OFFLINE", counts.offline, WifiOff, "summary-muted"]] as const;
  return <div className="operator-summary"><span className={`socket-pill ${connection === "connected" ? "connected" : ""}`}><i />{connection === "connected" ? "LIVE" : connection.toUpperCase()}</span>{items.map(([label, value, Icon, tone]) => <span className="summary-pill" key={label}><b className={tone}>{value}</b><Icon size={14} />{label}</span>)}</div>;
}
