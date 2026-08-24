"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { EVENT_ID as eventId } from "@/src/constants/event";

const AUTH_QUERY_KEY = ["auth-user"] as const;

async function fetchUser(): Promise<User | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchUser,
    staleTime: Infinity, // 로그인 상태는 onAuthStateChange가 갱신해줄 거라 자체 재요청 불필요
  });

  // 세션 변화(로그인/로그아웃/토큰 갱신) 감지 → 캐시에 직접 반영
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        queryClient.setQueryData(AUTH_QUERY_KEY, session?.user ?? null);

        if (event === "SIGNED_OUT") {
          queryClient.clear(); // 로그아웃 시 이전 유저의 모든 캐시(주문, 좋아요 등) 제거
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  const login = async () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || `/${eventId}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user: user ?? null, loading, login, logout };
}