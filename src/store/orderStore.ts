// src/store/orderStore.ts
import { create } from "zustand";
import { OrderItem } from "../types/order";

interface OrderState {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, "quantity">) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalAmount: () => number;
  totalQuantity: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === item.productId
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
          existing.totalQuantity != null &&
          nextQuantity > existing.totalQuantity
        ) {
          return state;
        }

        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: nextQuantity }
              : i
          ),
        };
      }

      if (item.totalQuantity != null && item.totalQuantity <= 0) {
        return state;
      }

      return {
        items: [...state.items, { ...item, quantity: 1 }],
      };
    }),

  increment: (productId) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.productId !== productId) {
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
          item.totalQuantity != null &&
          nextQuantity > item.totalQuantity
        ) {
          return item;
        }

        return {
          ...item,
          quantity: nextQuantity,
        };
      }),
    })),

  decrement: (productId) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    })),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  clear: () => set({ items: [] }),

  totalAmount: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  totalQuantity: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));