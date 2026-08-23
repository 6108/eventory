// src/store/boothStore.ts
import { create } from "zustand";

interface BoothState {
  boothId: string | null;
  checked: boolean;
  setBoothId: (id: string | null) => void;
  fetchBoothId: () => Promise<void>;
}

export const useBoothStore = create<BoothState>((set) => ({
  boothId: null,
  checked: false,

  setBoothId: (id) => set({ boothId: id, checked: true }),

  fetchBoothId: async () => {
    const res = await fetch("/api/booth/my");
    const data = await res.json();
    set({ boothId: data?.boothId ?? null, checked: true });
  },
}));