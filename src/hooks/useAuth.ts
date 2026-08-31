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
    staleTime: Infinity,
  });

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        queryClient.setQueryData(AUTH_QUERY_KEY, session?.user ?? null);
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

  return {
    user: user ?? null,
    loading,
    login,
    logout,
  };
}