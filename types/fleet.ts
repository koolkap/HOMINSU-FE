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

export type DevicePatch = { id: string; patch: Partial<FleetDevice> };

export type SyncPlayCommand = {
  type: "SYNC_PLAY";
  commandId: string;
  videoUrl: string;
  targetDeviceIds: string[];
  positionSeconds: number;
  startAtMs: number;
};

export type FleetServerMessage =
  | { type: "SNAPSHOT"; devices: unknown[]; sentAt?: string }
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
