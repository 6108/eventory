// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartGroup, CartItem } from "../types/cart";

interface CartState {
  items: CartItem[];

  addItem: (cartItem: CartItem) => void;
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

      addItem: (cartItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === cartItem.productId && i.optionId === cartItem.optionId
          );

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
            };
          }

          if (cartItem.remainingQuantity != null && cartItem.remainingQuantity <= 0) {
            return state;
          }

          return {
            items: [...state.items, cartItem],
          };
        }),

      increment: (productId, optionId) =>
        set((state) => ({
          items: state.items.map((cartItem) => {
            if (cartItem.productId !== productId || cartItem.optionId !== optionId) {
              return cartItem;
            }

            const nextQuantity = cartItem.quantity + 1;

            if (cartItem.purchaseLimit != null && nextQuantity > cartItem.purchaseLimit) {
              return cartItem;
            }

            if (
              cartItem.remainingQuantity != null &&
              nextQuantity > cartItem.remainingQuantity
            ) {
              return cartItem;
            }

            return { ...cartItem, quantity: nextQuantity };
          }),
        })),

      decrement: (productId, optionId) =>
        set((state) => ({
          items: state.items
            .map((cartItem) =>
              cartItem.productId === productId && cartItem.optionId === optionId
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            )
            .filter((cartItem) => cartItem.quantity > 0),
        })),

      removeItem: (productId, optionId) =>
        set((state) => ({
          items: state.items.filter(
            (cartItem) =>
              !(cartItem.productId === productId && cartItem.optionId === optionId)
          ),
        })),

      clearBooth: (boothId) =>
        set((state) => ({
          items: state.items.filter((cartItem) => cartItem.boothId !== boothId),
        })),

      clearAll: () => set({ items: [] }),

      totalQuantity: () =>
        get().items.reduce((sum, cartItem) => sum + cartItem.quantity, 0),

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
      name: "cart-storage", // localStorage key
      // TODO: 로그인 시 서버(계정)에 저장된 장바구니와 병합하는 로직은 아직 없음.
      // 지금은 비로그인/로그인 구분 없이 항상 로컬(브라우저)에만 저장됨.
      // 로그인 계정 기반으로 넘어갈 때 이 부분부터 손보면 됨 (기획서 "비로그인 → 로그인 병합" 항목)
    }
  )
);