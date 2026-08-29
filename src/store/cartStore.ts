// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartGroup, CartItem } from "../types/cart";

// 구매제한에 막혔을 때 어떤 아이템에서 막혔는지 기록
// (기존엔 조용히 무시만 해서 사용자가 왜 안 늘어나는지 알 수 없었음 - QA 3-2)
export type CartLimitBlock = {
  productId: string;
  optionId: string | null;
  reason: "purchaseLimit";
} | null;

interface CartState {
  items: CartItem[];
  sentBoothIds: Record<string, string>; // boothId -> 마지막 전송 시각(ISO)
  lastBlocked: CartLimitBlock;

  addItem: (cartItem: CartItem) => void;
  increment: (productId: string, optionId: string | null) => void;
  decrement: (productId: string, optionId: string | null) => void;
  removeItem: (productId: string, optionId: string | null) => void;
  clearBooth: (boothId: string) => void;
  clearAll: () => void;
  markBoothSent: (boothId: string) => void;
  clearBlocked: () => void;

  // 파생 데이터
  totalQuantity: () => number;
  groupedByBooth: () => CartGroup[];
}

// 재고/구매제한 초과 시 클라이언트단에서 막고, lastBlocked에 사유를 남겨 UI가 안내 문구를 띄울 수 있게 함
// -> 서버(주문 생성 API)에서 한 번 더 검증하는 이중 방어 구조는 그대로 유지
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sentBoothIds: {},
      lastBlocked: null,

      addItem: (cartItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === cartItem.productId && i.optionId === cartItem.optionId
          );

          const nextSentBoothIds = { ...state.sentBoothIds };
          delete nextSentBoothIds[cartItem.boothId];

          if (existing) {
            const nextQuantity = existing.quantity + cartItem.quantity;

            // 구매 제한만 담기 단계에서 차단. 재고는 확인하지 않고 그냥 담게 둠
            // (얼마나 남았는지 노출하고 싶지 않음 + 최종 검증은 전송 시점에 서버가 수행)
            if (
              existing.purchaseLimit != null &&
              nextQuantity > existing.purchaseLimit
            ) {
              return {
                lastBlocked: {
                  productId: existing.productId,
                  optionId: existing.optionId,
                  reason: "purchaseLimit",
                },
              };
            }

            return {
              items: state.items.map((i) =>
                i.productId === cartItem.productId && i.optionId === cartItem.optionId
                  ? { ...i, quantity: nextQuantity }
                  : i
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
            if (item.productId !== productId || item.optionId !== optionId) {
              return item;
            }

            const nextQuantity = item.quantity + 1;

            // 구매 제한만 차단. 재고는 확인하지 않고 증가 허용 (전송 시점에 서버가 최종 검증)
            if (
              item.purchaseLimit != null &&
              nextQuantity > item.purchaseLimit
            ) {
              blocked = { productId, optionId, reason: "purchaseLimit" };
              return item;
            }

            delete nextSentBoothIds[item.boothId];

            return { ...item, quantity: nextQuantity };
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
              if (item.productId !== productId || item.optionId !== optionId) {
                return item;
              }

              delete nextSentBoothIds[item.boothId];

              return { ...item, quantity: item.quantity - 1 };
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
            (item) => item.productId === productId && item.optionId === optionId
          );

          const nextSentBoothIds = { ...state.sentBoothIds };
          if (target) {
            delete nextSentBoothIds[target.boothId];
          }

          return {
            items: state.items.filter(
              (item) => !(item.productId === productId && item.optionId === optionId)
            ),
            sentBoothIds: nextSentBoothIds,
          };
        }),

      clearBooth: (boothId) =>
        set((state) => {
          const nextSentBoothIds = { ...state.sentBoothIds };
          delete nextSentBoothIds[boothId];

          return {
            items: state.items.filter((item) => item.boothId !== boothId),
            sentBoothIds: nextSentBoothIds,
          };
        }),

      clearAll: () => set({ items: [], sentBoothIds: {}, lastBlocked: null }),

      clearBlocked: () => set({ lastBlocked: null }),

      markBoothSent: (boothId) =>
        set((state) => ({
          sentBoothIds: {
            ...state.sentBoothIds,
            [boothId]: new Date().toISOString(),
          },
        })),

      totalQuantity: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      groupedByBooth: () => {
        const items = get().items;
        const map = new Map<string, CartGroup>();

        for (const cartItem of items) {
          const group = map.get(cartItem.boothId);

          if (group) {
            group.items.push(cartItem);
            group.totalAmount += cartItem.price * cartItem.quantity;
            group.totalQuantity += cartItem.quantity;
          } else {
            map.set(cartItem.boothId, {
              boothId: cartItem.boothId,
              boothName: cartItem.boothName,
              boothNumber: cartItem.boothNumber,
              items: [cartItem],
              totalAmount: cartItem.price * cartItem.quantity,
              totalQuantity: cartItem.quantity,
            });
          }
        }

        return Array.from(map.values());
      },
    }),
    {
      name: "boothspot-cart",
    }
  )
);