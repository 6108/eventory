// src/hooks/useRequireLogin.ts
"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";

export function useRequireLogin() {
  const { login } = useAuth();
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  return function requireLogin(message: string) {
    openConfirmModal({
      title: "로그인 하시겠습니까?",
      message,
      confirmText: "로그인",
      cancelText: "취소",
      onConfirm: () => login(),
    });
  };
}
