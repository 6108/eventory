import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartGroup, CartItem } from "../types/cart";

export type CartLimitBlock = {
  productId: string;
  optionId: string | null;
  reason: "purchaseLimit";
} | null;

interface CartState {
  items: CartItem[];
  sentBoothIds: Record<string, string>;
  lastBlocked: CartLimitBlock;
  isSynced: boolean;

  addItem: (cartItem: CartItem) => void;
  increment: (productId: string, optionId: string | null) => void;
  decrement: (productId: string, optionId: string | null) => void;
  removeItem: (productId: string, optionId: string | null) => void;
  clearBooth: (boothId: string) => void;
  clearAll: () => void;
  markBoothSent: (boothId: string) => void;
  clearBlocked: () => void;
  syncLimits: (
    updates: {
      productId: string;
      optionId: string | null;
      purchaseLimit: number | null;
      remainingQuantity: number | null;
    }[]
  ) => void;

  hydrateFromServer: (items: CartItem[]) => void;
  setSynced: (synced: boolean) => void;

  totalQuantity: () => number;
  groupedByBooth: () => CartGroup[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sentBoothIds: {},
      lastBlocked: null,
      isSynced: false,

      addItem: (cartItem) =>
        set((state) => {
          const existing = state.items.find(
            (item) =>
              item.productId === cartItem.productId &&
              item.optionId === cartItem.optionId
          );

          const nextSentBoothIds = { ...state.sentBoothIds };
          delete nextSentBoothIds[cartItem.boothId];

          if (existing) {
            const nextQuantity = existing.quantity + cartItem.quantity;

            if (
              cartItem.purchaseLimit != null &&
              nextQuantity > cartItem.purchaseLimit
            ) {
              return {
                items: state.items.map((item) =>
                  item.productId === cartItem.productId &&
                    item.optionId === cartItem.optionId
                    ? {
                      ...item,
                      purchaseLimit: cartItem.purchaseLimit,
                      remainingQuantity: cartItem.remainingQuantity,
                    }
                    : item
                ),
                lastBlocked: {
                  productId: existing.productId,
                  optionId: existing.optionId,
                  reason: "purchaseLimit",
                },
              };
            }

            return {
              items: state.items.map((item) =>
                item.productId === cartItem.productId &&
                  item.optionId === cartItem.optionId
                  ? {
                    ...item,
                    quantity: nextQuantity,
                    purchaseLimit: cartItem.purchaseLimit,
                    remainingQuantity: cartItem.remainingQuantity,
                  }
                  : item
              ),
              sentBoothIds: nextSentBoothIds,
              lastBlocked: null,
            };
          }

          if (
            cartItem.purchaseLimit != null &&
            cartItem.quantity > cartItem.purchaseLimit
          ) {
            return {
              lastBlocked: {
                productId: cartItem.productId,
                optionId: cartItem.optionId,
                reason: "purchaseLimit",
              },
            };
          }

          return {
            items: [...state.items, cartItem],
            sentBoothIds: nextSentBoothIds,
            lastBlocked: null,
          };
        }),

      increment: (productId, optionId) =>
        set((state) => {
          const nextSentBoothIds = { ...state.sentBoothIds };
          let blocked: CartLimitBlock = null;

          const items = state.items.map((item) => {
            if (
              item.productId !== productId ||
              item.optionId !== optionId
            ) {
              return item;
            }

            const nextQuantity = item.quantity + 1;

            if (
              item.purchaseLimit != null &&
              nextQuantity > item.purchaseLimit
            ) {
              blocked = {
                productId,
                optionId,
                reason: "purchaseLimit",
              };
              return item;
            }

            delete nextSentBoothIds[item.boothId];

            return {
              ...item,
              quantity: nextQuantity,
            };
          });

          return {
            items,
            sentBoothIds: nextSentBoothIds,
            lastBlocked: blocked,
          };
        }),

      decrement: (productId, optionId) =>
        set((state) => {
          const nextSentBoothIds = { ...state.sentBoothIds };

          const nextItems = state.items
            .map((item) => {
              if (
                item.productId !== productId ||
                item.optionId !== optionId
              ) {
                return item;
              }

              delete nextSentBoothIds[item.boothId];

              return {
                ...item,
                quantity: item.quantity - 1,
              };
            })
            .filter((item) => item.quantity > 0);

          return {
            items: nextItems,
            sentBoothIds: nextSentBoothIds,
            lastBlocked: null,
          };
        }),

      removeItem: (productId, optionId) =>
        set((state) => {
          const target = state.items.find(
            (item) =>
              item.productId === productId &&
              item.optionId === optionId
          );

          const nextSentBoothIds = { ...state.sentBoothIds };

          if (target) {
            delete nextSentBoothIds[target.boothId];
          }

          return {
            items: state.items.filter(
              (item) =>
                !(
                  item.productId === productId &&
                  item.optionId === optionId
                )
            ),
            sentBoothIds: nextSentBoothIds,
          };
        }),

      clearBooth: (boothId) =>
        set((state) => {
          const nextSentBoothIds = { ...state.sentBoothIds };
          delete nextSentBoothIds[boothId];

          return {
            items: state.items.filter(
              (item) => item.boothId !== boothId
            ),
            sentBoothIds: nextSentBoothIds,
          };
        }),

      clearAll: () =>
        set({
          items: [],
          sentBoothIds: {},
          lastBlocked: null,
        }),

      markBoothSent: (boothId) =>
        set((state) => ({
          sentBoothIds: {
            ...state.sentBoothIds,
            [boothId]: new Date().toISOString(),
          },
        })),

      clearBlocked: () =>
        set({
          lastBlocked: null,
        }),

      syncLimits: (updates) =>
        set((state) => {
          if (updates.length === 0) return state;

          const nextSentBoothIds = { ...state.sentBoothIds };
          let blocked: CartLimitBlock = null;

          const items = state.items.map((item) => {
            const update = updates.find(
              (value) =>
                value.productId === item.productId &&
                value.optionId === item.optionId
            );

            if (!update) return item;

            let nextQuantity = item.quantity;

            if (
              update.purchaseLimit != null &&
              nextQuantity > update.purchaseLimit
            ) {
              nextQuantity = update.purchaseLimit;
              blocked = {
                productId: item.productId,
                optionId: item.optionId,
                reason: "purchaseLimit",
              };
            }

            if (nextQuantity !== item.quantity) {
              delete nextSentBoothIds[item.boothId];
            }

            return {
              ...item,
              purchaseLimit: update.purchaseLimit,
              remainingQuantity: update.remainingQuantity,
              quantity: nextQuantity,
            };
          });

          return {
            items: items.filter((item) => item.quantity > 0),
            sentBoothIds: nextSentBoothIds,
            lastBlocked: blocked ?? state.lastBlocked,
          };
        }),

      hydrateFromServer: (items) =>
        set({
          items,
          sentBoothIds: {},
          lastBlocked: null,
        }),

      setSynced: (synced) =>
        set({
          isSynced: synced,
        }),

      totalQuantity: () =>
        get().items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),

      groupedByBooth: () => {
        const items = get().items;
        const map = new Map<string, CartGroup>();

        for (const cartItem of items) {
          const group = map.get(cartItem.boothId);

          if (group) {
            group.items.push(cartItem);
            group.totalAmount +=
              cartItem.price * cartItem.quantity;
            group.totalQuantity += cartItem.quantity;
          } else {
            map.set(cartItem.boothId, {
              boothId: cartItem.boothId,
              boothName: cartItem.boothName,
              boothNumber: cartItem.boothNumber,
              items: [cartItem],
              totalAmount:
                cartItem.price * cartItem.quantity,
              totalQuantity: cartItem.quantity,
            });
          }
        }

        return Array.from(map.values());
      },
    }),
    {
      name: "boothspot-cart",
      partialize: (state) => ({
        items: state.items,
        sentBoothIds: state.sentBoothIds,
      }),
    }
  )
);