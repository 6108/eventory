import Link from "next/link"

export function Navbar() {
  return (
    <nav className="w-full h-14 px-6 flex items-center justify-between border-b">
      <Link href="/" className="font-medium text-base">
        로고
      </Link>
      <div className="flex items-center gap-4">
        {/* 네비 아이템 */}
      </div>
    </nav>
  )
}