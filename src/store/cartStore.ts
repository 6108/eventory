// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartGroup, CartItem } from "../types/cart";

interface CartState {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  increment: (productId: string, optionId: string | null) => void;
  decrement: (productId: string, optionId: string | null) => void;
  removeItem: (productId: string, optionId: string | null) => void;
  clearBooth: (boothId: string) => void;
  clearAll: () => void;

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

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId && i.optionId === item.optionId
          );

          if (existing) {
            const nextQuantity = existing.quantity + quantity;

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
            items: [...state.items, { ...item, quantity }],
          };
        }),

      increment: (productId, optionId) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId !== productId || item.optionId !== optionId) {
              return item;
            }

            const nextQuantity = item.quantity + 1;

            if (item.purchaseLimit != null && nextQuantity > item.purchaseLimit) {
              return item;
            }

            if (
              item.remainingQuantity != null &&
              nextQuantity > item.remainingQuantity
            ) {
              return item;
            }

            return { ...item, quantity: nextQuantity };
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

      clearBooth: (boothId) =>
        set((state) => ({
          items: state.items.filter((i) => i.boothId !== boothId),
        })),

      clearAll: () => set({ items: [] }),

      totalQuantity: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      groupedByBooth: () => {
        const items = get().items;
        const map = new Map<string, CartGroup>();

        for (const item of items) {
          const group = map.get(item.boothId);

          if (group) {
            group.items.push(item);
            group.totalAmount += item.price * item.quantity;
            group.totalQuantity += item.quantity;
          } else {
            map.set(item.boothId, {
              boothId: item.boothId,
              boothName: item.boothName,
              items: [item],
              totalAmount: item.price * item.quantity,
              totalQuantity: item.quantity,
            });
          }
        }

        return Array.from(map.values());
      },
    }),
    {
      name: "cart-storage", // localStorage key
      // TODO: 로그인 시 서버(계정)에 저장된 장바구니와 병합하는 로직은 아직 없음.
      // 지금은 비로그인/로그인 구분 없이 항상 로컬(브라우저)에만 저장됨.
      // 로그인 계정 기반으로 넘어갈 때 이 부분부터 손보면 됨 (기획서 "비로그인 → 로그인 병합" 항목)
    }
  )
);
