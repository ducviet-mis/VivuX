import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { ClientLayout } from "@/components/layout/client-layout";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const viewport: Viewport = {
  themeColor: "#1a1625",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "VivuX — Nền tảng Học & Tự luyện Toán thông minh",
  description:
    "Hệ thống quản lý lớp học, thi thử trực tuyến, cẩm nang toán học và tự luyện toán thông minh.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VivuX",
  },
  formatDetection: {
    telephone: false,
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
