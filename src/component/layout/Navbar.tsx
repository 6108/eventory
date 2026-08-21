import Link from "next/link";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { Login } from "../auth/Login";
import CartNavLink from "../cart/CartNavLink";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-zinc-950 z-50">
      <div className="h-full w-full px-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-medium text-base text-[#9B1820] shrink-0"
        >
          𝐑𝐞𝐝𝐞𝐦𝐩𝐭𝐢𝐨𝐧
        </Link>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href={`/${eventId}/booths`}
            className="text-primary hover:text-white whitespace-nowrap"
          >
            부스 리스트
          </Link>

          <Link
            href={`/${eventId}/products`}
            className="text-primary hover:text-white whitespace-nowrap"
          >
            회지 및 굿즈
          </Link>
          <CartNavLink />
          <Login />
        </div>
      </div>
    </nav>
  );
}