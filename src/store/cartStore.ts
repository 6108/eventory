// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartGroup, CartItem } from "../types/cart";

interface CartState {
  items: CartItem[];
  sentBoothIds: Record<string, string>; // boothId -> 마지막 전송 시각(ISO)

  addItem: (cartItem: CartItem) => void;
  increment: (productId: string, optionId: string | null) => void;
  decrement: (productId: string, optionId: string | null) => void;
  removeItem: (productId: string, optionId: string | null) => void;
  clearBooth: (boothId: string) => void;
  clearAll: () => void;
  markBoothSent: (boothId: string) => void;

  // 파생 데이터
  totalQuantity: () => number;
  groupedByBooth: () => CartGroup[];
}

// orderStore(POS)와 동일하게 재고/구매제한 초과 시 조용히 무시하는 방식으로 클라이언트단 검증
// -> 서버(주문 생성 API)에서 한 번 더 검증하는 이중 방어 구조는 그대로 유지
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sentBoothIds: {},

      addItem: (cartItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === cartItem.productId && i.optionId === cartItem.optionId
          );

          // 부스에 다시 담기 시작하면, 이전에 보낸 요청은 더이상 최신 상태가 아니므로
          // "전송됨" 표시를 해제해서 사용자가 다시 보내야 함을 인지하게 함
          const nextSentBoothIds = { ...state.sentBoothIds };
          delete nextSentBoothIds[cartItem.boothId];

          if (existing) {
            const nextQuantity = existing.quantity + cartItem.quantity;

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
                i.productId === cartItem.productId && i.optionId === cartItem.optionId
                  ? { ...i, quantity: nextQuantity }
                  : i
              ),
              sentBoothIds: nextSentBoothIds,
            };
          }

          if (cartItem.remainingQuantity != null && cartItem.remainingQuantity <= 0) {
            return state;
          }

          return {
            items: [...state.items, cartItem],
            sentBoothIds: nextSentBoothIds,
          };
        }),

      increment: (productId, optionId) =>
        set((state) => {
          const nextSentBoothIds = { ...state.sentBoothIds };

          return {
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

              delete nextSentBoothIds[item.boothId];

              return { ...item, quantity: nextQuantity };
            }),
            sentBoothIds: nextSentBoothIds,
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

      clearAll: () => set({ items: [], sentBoothIds: {} }),

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