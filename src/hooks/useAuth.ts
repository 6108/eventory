"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { EVENT_ID as eventId } from "@/src/constants/event";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

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

  return { user, loading, login, logout };
}