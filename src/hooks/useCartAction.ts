"use client";

import { useAuth } from "./useAuth";
import { useCartStore } from "@/src/store/cartStore";
import type { CartItem } from "@/src/types/cart";
import {
  clearServerCart,
  deleteCartItem,
  saveCartItem,
} from "@/src/lib/action/cart";

export function useCartActions() {
  const { user } = useAuth();

  const storeAddItem = useCartStore((s) => s.addItem);
  const storeIncrement = useCartStore((s) => s.increment);
  const storeDecrement = useCartStore((s) => s.decrement);
  const storeRemoveItem = useCartStore((s) => s.removeItem);
  const storeClearAll = useCartStore((s) => s.clearAll);

  function getItem(productId: string, optionId: string | null) {
    return useCartStore
      .getState()
      .items.find(
        (item) =>
          item.productId === productId && item.optionId === optionId
      );
  }

  function addItem(cartItem: CartItem) {
    storeAddItem(cartItem);

    if (!user) return;

    const updated = getItem(cartItem.productId, cartItem.optionId);

    if (updated) {
      void saveCartItem(user.id, {
        productId: updated.productId,
        optionId: updated.optionId,
        quantity: updated.quantity,
      });
    }
  }

  function increment(productId: string, optionId: string | null) {
    storeIncrement(productId, optionId);

    if (!user) return;

    const updated = getItem(productId, optionId);

    if (updated) {
      void saveCartItem(user.id, {
        productId,
        optionId,
        quantity: updated.quantity,
      });
    }
  }

  function decrement(productId: string, optionId: string | null) {
    storeDecrement(productId, optionId);

    if (!user) return;

    const updated = getItem(productId, optionId);

    if (updated) {
      void saveCartItem(user.id, {
        productId,
        optionId,
        quantity: updated.quantity,
      });
    } else {
      void deleteCartItem(user.id, productId, optionId);
    }
  }

  function removeItem(productId: string, optionId: string | null) {
    storeRemoveItem(productId, optionId);

    if (user) {
      void deleteCartItem(user.id, productId, optionId);
    }
  }

  function clearAll() {
    storeClearAll();

    if (user) {
      void clearServerCart(user.id);
    }
  }

  return {
    addItem,
    increment,
    decrement,
    removeItem,
    clearAll,
  };
}