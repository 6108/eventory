// src/hooks/useOptimisticToggle.ts
"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const DEFAULT_SYNC_DELAY_MS = 500;

interface UseOptimisticToggleOptions {
  initialValue: boolean;
  serverValue?: boolean;
  onToggle?: (value: boolean) => void;
  sync: (target: boolean) => Promise<void>;
  errorMessage: (target: boolean) => string;
  syncDelayMs?: number;
}

export function useOptimisticToggle({
  initialValue,
  serverValue,
  onToggle,
  sync,
  errorMessage,
  syncDelayMs = DEFAULT_SYNC_DELAY_MS,
}: UseOptimisticToggleOptions) {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [isSyncing, setIsSyncing] = useState(false);

  const confirmedRef = useRef(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (serverValue === undefined) return;
    if (timerRef.current) return;

    confirmedRef.current = serverValue;
    setDisplayValue(serverValue);
  }, [serverValue]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function scheduleSync() {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      setDisplayValue((current) => {
        if (current === confirmedRef.current) return current;

        const target = current;
        setIsSyncing(true);

        sync(target)
          .then(() => {
            confirmedRef.current = target;
          })
          .catch((error) => {
            console.error(error);
            setDisplayValue(confirmedRef.current);
            onToggle?.(confirmedRef.current);
            toast.error(errorMessage(target));
          })
          .finally(() => {
            setIsSyncing(false);
          });

        return current;
      });
    }, syncDelayMs);
  }

  function toggle(next: boolean) {
    setDisplayValue(next);
    onToggle?.(next);
    scheduleSync();
  }

  return { displayValue, isSyncing, toggle };
}
