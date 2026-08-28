"use client";

import { ReactNode } from "react";

interface IconActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

export default function IconActionButton({
  icon,
  label,
  onClick,
  type = "button",
  disabled,
  active = false,
  className = "",
}: IconActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex shrink-0 items-center gap-1 rounded border px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active
        ? "border-primary bg-primary/10 text-primary"
        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        } ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}