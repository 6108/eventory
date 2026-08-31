"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/src/store/cartStore";
import { getMyCartItems } from "@/src/lib/data/cart";
import { saveLocalCartToServer } from "@/src/lib/action/cart";
import { useAuth } from "./useAuth";

export function useCartSync() {
  const { user, loading } = useAuth();
  const syncingRef = useRef(false);

  const hydrateFromServer = useCartStore((s) => s.hydrateFromServer);
  const clearAll = useCartStore((s) => s.clearAll);
  const setSynced = useCartStore((s) => s.setSynced);

  useEffect(() => {
    if (loading || syncingRef.current) return;

    if (!user) {
      setSynced(false);
      return;
    }

    const userId = user.id;
    syncingRef.current = true;

    async function sync() {
      try {
        const serverItems = await getMyCartItems(userId);
        const localItems = useCartStore.getState().items;

        if (serverItems.length === 0 && localItems.length > 0) {
          await saveLocalCartToServer(userId, localItems);

          const savedItems = await getMyCartItems(userId);
          hydrateFromServer(savedItems);
        } else {
          hydrateFromServer(serverItems);
        }

        setSynced(true);
      } catch (error) {
        console.error("장바구니 동기화 실패:", error);
      } finally {
        syncingRef.current = false;
      }
    }

    void sync();
  }, [loading, user, hydrateFromServer, setSynced]);
}