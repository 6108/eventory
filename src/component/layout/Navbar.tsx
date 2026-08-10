import Link from "next/link"
import { EVENT_ID as eventId } from "@/src/constants/event";
import { Login } from "../auth/Login";

export function Navbar() {
  return (
    <nav className="fixed w-full h-14 px-6 flex items-center justify-between bg-zinc-950 z-999">
      <Link href="/" className="font-medium text-base text-[#9B1820]">
        𝐑𝐞𝐝𝐞𝐦𝐩𝐭𝐢𝐨𝐧
      </Link>
      <div className="flex items-center gap-4">
        {/* 네비 아이템 */}
        <Link href={`/${eventId}/booths`} className="cursor-pointer text-primary hover:text-white">
          <span>부스 리스트</span>
        </Link>
        <Link href={`/${eventId}/products`} className="cursor-pointer text-primary hover:text-white">
          <span>회지 및 굿즈</span>
        </Link>
        <Login />
      </div>
    </nav>
  )
}