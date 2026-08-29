// src/component/auth/UserMenuItem.tsx

import Link from "next/link";

interface UserMenuItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export default function UserMenuItem({ href, children, onClick }: UserMenuItemProps) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-primary"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
