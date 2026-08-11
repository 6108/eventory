"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginRequiredToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("login") === "required") {
      toast.error("로그인이 필요한 페이지입니다.");
      router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}