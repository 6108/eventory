// src/store/confirmModalStore.ts
import { create } from "zustand";

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;

  setOpen: (open: boolean) => void;
  openConfirmModal: (options: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmModalStore = create<ConfirmModalState>((set, get) => ({
  isOpen: false,
  title: "",
  message: "",
  confirmText: "",
  cancelText: "",
  onConfirm: () => { },
  onCancel: () => { },

  setOpen: (open) => set({ isOpen: open }),

  openConfirmModal: (options) => set({ isOpen: true, ...options }),

  handleConfirm: () => {
    get().onConfirm?.();
    set({ isOpen: false });
  },

  handleCancel: () => {
    get().onCancel?.();
    set({ isOpen: false });
  },
}));