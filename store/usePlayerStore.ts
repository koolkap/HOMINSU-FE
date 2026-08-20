import { create } from "zustand";

type PlayerState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  muted: boolean;
  setPlaying: (isPlaying: boolean) => void;
  setProgress: (currentTime: number, duration: number) => void;
  setMuted: (muted: boolean) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  muted: true,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (currentTime, duration) => set({ currentTime, duration }),
  setMuted: (muted) => set({ muted }),
}));
