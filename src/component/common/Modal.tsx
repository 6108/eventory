"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md";
}

const maxWidthClass = { xs: "max-w-xs", sm: "max-w-sm", md: "max-w-md" };

export default function Modal({ isOpen, onClose, children, maxWidth = "sm" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 z-999"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidthClass[maxWidth]} overflow-y-auto rounded-lg bg-zinc-900 p-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}