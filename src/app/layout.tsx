import type { Metadata } from "next";
import "@/src/styles/globals.css";
import { Navbar } from "../component/layout/Navbar";
import { Footer } from "../component/layout/Footer";
import DisableContextMenu from "../component/common/DisableContextMenu";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "프로젝트 이름",
  description: "프로젝트 설명",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full max-w-7xl mx-auto">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-300">
        <Toaster />
        <DisableContextMenu />

        <Navbar />

        <main className="flex-1 p-8 pt-20">
          {children}
        </main>

        {/* <Footer /> */}
      </body>
    </html>
  );
}