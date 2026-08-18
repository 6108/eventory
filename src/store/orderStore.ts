// src/store/orderStore.ts
import { create } from "zustand";
import { OrderItem } from "../types/order";

interface OrderState {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, "quantity">) => void;
  increment: (productId: string, optionId: string | null) => void;
  decrement: (productId: string, optionId: string | null) => void;
  removeItem: (productId: string, optionId: string | null) => void;
  clear: () => void;
  totalAmount: () => number;
  totalQuantity: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === item.productId && i.optionId === item.optionId
      );

      if (existing) {
        const nextQuantity = existing.quantity + 1;

        if (
          existing.purchaseLimit != null &&
          nextQuantity > existing.purchaseLimit
        ) {
          return state;
        }

        if (
          existing.remainingQuantity != null &&
          nextQuantity > existing.remainingQuantity
        ) {
          return state;
        }

        return {
          items: state.items.map((i) =>
            i.productId === item.productId && i.optionId === item.optionId
              ? { ...i, quantity: nextQuantity }
              : i
          ),
        };
      }

      if (item.remainingQuantity != null && item.remainingQuantity <= 0) {
        return state;
      }

      return {
        items: [...state.items, { ...item, quantity: 1 }],
      };
    }),

  increment: (productId, optionId) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.productId !== productId || item.optionId !== optionId) {
          return item;
        }

        const nextQuantity = item.quantity + 1;

        if (
          item.purchaseLimit != null &&
          nextQuantity > item.purchaseLimit
        ) {
          return item;
        }

        if (
          item.remainingQuantity != null &&
          nextQuantity > item.remainingQuantity
        ) {
          return item;
        }

        return {
          ...item,
          quantity: nextQuantity,
        };
      }),
    })),

  decrement: (productId, optionId) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.productId === productId && i.optionId === optionId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    })),

  removeItem: (productId, optionId) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.productId === productId && i.optionId === optionId)
      ),
    })),

  clear: () => set({ items: [] }),

  totalAmount: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  totalQuantity: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));