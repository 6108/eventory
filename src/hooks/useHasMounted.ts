// src/hooks/useHasMounted.ts
"use client";

import { useEffect, useState } from "react";

// localStorage 등 브라우저에만 있는 값을 쓰는 컴포넌트에서
// 서버 렌더링 결과와 클라이언트 첫 렌더링 결과가 달라지는 걸(hydration mismatch) 막기 위한 훅.
// 마운트 전에는 서버와 동일한 값(false)을 반환하고, 마운트 후에만 true로 바뀜.
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
