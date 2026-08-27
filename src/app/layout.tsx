import type { Metadata } from "next";
import "@/src/styles/globals.css";
import { Navbar } from "../component/layout/Navbar";
import { Footer } from "../component/layout/Footer";
import DisableContextMenu from "../component/common/DisableContextMenu";
import { Toaster } from "react-hot-toast";
import ConfirmModal from "../component/common/ConfirmModal";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "redemption",
  description: "솔음사헌 배포전",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full max-w-7xl mx-auto">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-300">
        <Providers>
          <Toaster />
          <DisableContextMenu />
          <ConfirmModal />
          <Navbar />

          <main className="flex-1 p-8 pt-20">{children}</main>

          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  );
}