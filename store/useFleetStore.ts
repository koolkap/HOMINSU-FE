import { create } from 'zustand';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'UPDATING' | 'LOW_BATTERY';

export interface Device {
  id: string;
  name: string;
  ip_address: string;
  battery_level: number;
  status: DeviceStatus;
  firmware: string;
  model: string;
  current_video?: string;
}

interface FleetState {
  devices: Device[];
  selectedDevices: string[];
  syncVideoUrl: string;
  setDevices: (devices: Device[]) => void;
  updateDevice: (id: string, data: Partial<Device>) => void;
  toggleDevice: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSyncVideoUrl: (url: string) => void;
}

const MOCK_DEVICES: Device[] = [
  { id: 'HS-01', name: 'Headset 01', ip_address: '10.0.15.52', battery_level: 75, status: 'ONLINE', firmware: 'v2.4.0', model: 'Quest Pro', current_video: '항공] 우음도' },
  { id: 'HS-02', name: 'Headset 02', ip_address: '10.0.15.53', battery_level: 82, status: 'ONLINE', firmware: 'v2.4.0', model: 'Quest 3', current_video: '' },
  { id: 'HS-03', name: 'Headset 03', ip_address: '10.0.15.54', battery_level: 45, status: 'ONLINE', firmware: 'v2.4.0', model: 'Quest Pro', current_video: '' },
  { id: 'HS-04', name: 'Headset 04', ip_address: '10.0.15.55', battery_level: 18, status: 'LOW_BATTERY', firmware: 'v2.3.8', model: 'Quest 2', current_video: '' },
  { id: 'HS-05', name: 'Headset 05', ip_address: '10.0.15.56', battery_level: 92, status: 'ONLINE', firmware: 'v2.4.0', model: 'Quest Pro', current_video: '' },
  { id: 'HS-06', name: 'Headset 06', ip_address: '10.0.15.57', battery_level: 12, status: 'LOW_BATTERY', firmware: 'v2.3.8', model: 'Quest 2', current_video: '' },
  { id: 'HS-07', name: 'Headset 07', ip_address: '10.0.15.58', battery_level: 65, status: 'UPDATING', firmware: 'v2.3.8', model: 'Quest 3', current_video: '' },
  { id: 'HS-08', name: 'Headset 08', ip_address: '10.0.15.59', battery_level: 0, status: 'OFFLINE', firmware: 'v2.4.0', model: 'Quest Pro', current_video: '' },
  { id: 'HS-09', name: 'Headset 09', ip_address: '10.0.15.60', battery_level: 55, status: 'ONLINE', firmware: 'v2.4.0', model: 'Quest 3', current_video: '' },
  { id: 'HS-10', name: 'Headset 10', ip_address: '10.0.15.61', battery_level: 38, status: 'UPDATING', firmware: 'v2.3.8', model: 'Quest 2', current_video: '' },
  { id: 'HS-11', name: 'Headset 11', ip_address: '10.0.15.62', battery_level: 88, status: 'ONLINE', firmware: 'v2.4.0', model: 'Quest Pro', current_video: '' },
  { id: 'HS-12', name: 'Headset 12', ip_address: '10.0.15.63', battery_level: 71, status: 'ONLINE', firmware: 'v2.4.0', model: 'Quest 3', current_video: '' },
];

export const useFleetStore = create<FleetState>()((set) => ({
  devices: MOCK_DEVICES,
  selectedDevices: [],
  syncVideoUrl: 'http://localhost:8080/live/stream.m3u8',
  setDevices: (devices) => set({ devices }),
  updateDevice: (id, data) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, ...data } : d)),
    })),
  toggleDevice: (id) =>
    set((state) => ({
      selectedDevices: state.selectedDevices.includes(id)
        ? state.selectedDevices.filter((d) => d !== id)
        : [...state.selectedDevices, id],
    })),
  selectAll: () =>
    set((state) => ({
      selectedDevices: state.devices.filter((d) => d.status === 'ONLINE').map((d) => d.id),
    })),
  clearSelection: () => set({ selectedDevices: [] }),
  setSyncVideoUrl: (url) => set({ syncVideoUrl: url }),
}));
