import type { Metadata } from "next";
import "@/src/styles/globals.css";
import Navbar from "../component/layout/Navbar";
import Footer from "../component/layout/Footer";
import DisableContextMenu from "../component/common/DisableContextMenu";
import { Toaster } from "react-hot-toast";
import ConfirmModal from "../component/common/ConfirmModal";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://boothspot.net/"),
  title: "redemption",
  description: "솔음사헌 배포전",
  openGraph: {
    title: "redemption",
    description: "솔음사헌 배포전",
    url: "https://boothspot.net/",
    siteName: "redemption",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "redemption",
    description: "솔음사헌 배포전",
    images: ["/og-image.png"],
  },
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
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#18181b",   // zinc-900
                color: "#fafafa",
                border: "1px solid #27272a", // zinc-800
                fontSize: "14px",
                borderRadius: "8px",
                padding: "12px 16px",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#18181b" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#18181b" },
              },
            }}
          />
          <DisableContextMenu />
          <ConfirmModal />
          <Navbar />

          <main className="flex-1 p-4 pt-24 sm:p-8 sm:pt-20">{children}</main>

          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  );
}