import Link from "next/link";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { Login } from "../auth/Login";
import CartNavLink from "../cart/CartNavLink";

export function Navbar() {
  return (
    <nav className="fixed max-w-7xl mx-auto top-0 left-0 right-0 z-50 h-auto bg-zinc-950 shadow-[0_4px_20px_rgba(0,0,0,0.6)] sm:h-14">
      <div className="flex h-full w-full flex-col px-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Redemption */}
        <div className="my-2 flex h-8 items-center justify-center sm:my-0 sm:h-full sm:justify-start">
          <Link
            href="/"
            className="shrink-0 text-xl font-medium text-[#9B1820]"
          >
            𝐑𝐞𝐝𝐞𝐦𝐩𝐭𝐢𝐨𝐧
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex h-8 items-center justify-center gap-4 sm:h-full">
          <Link
            href={`/${eventId}/booths`}
            className="whitespace-nowrap text-primary hover:text-white"
          >
            부스
          </Link>

          <Link
            href={`/${eventId}/products`}
            className="whitespace-nowrap text-primary hover:text-white"
          >
            회지 & 굿즈
          </Link>

          <CartNavLink />

          <Login />
        </div>
      </div>
    </nav>
  );
}