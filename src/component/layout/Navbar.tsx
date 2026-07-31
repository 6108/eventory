import Link from "next/link"

export function Navbar() {
  return (
    <nav className="w-full h-14 px-6 flex items-center justify-between ">
      <Link href="/" className="font-medium text-base text-[#9B1820]">
        𝐑𝐞𝐝𝐞𝐦𝐩𝐭𝐢𝐨𝐧
      </Link>
      <div className="flex items-center gap-4">
        {/* 네비 아이템 */}
        <Link href="/redemption0919/booths" className="cursor-pointer text-[#9B1820] hover:text-white">
          <span>부스 리스트</span>
        </Link>
        <Link href="/redemption0919/items" className="cursor-pointer text-[#9B1820] hover:text-white">
          <span>회지 및 굿즈</span>
        </Link>
      </div>
    </nav>
  )
}