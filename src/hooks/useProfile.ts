"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";

export const PROFILE_QUERY_KEY = (userId?: string) =>
  ["profile", userId] as const;

async function fetchProfile(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("name, profile_image")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("프로필 조회 실패:", error);
    return null;
  }

  return data;
}

export function useProfile(userId?: string) {
  const { data: profile, isLoading } = useQuery({
    queryKey: PROFILE_QUERY_KEY(userId),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

  return { profile, loading: isLoading };
}