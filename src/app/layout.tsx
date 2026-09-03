import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { ClientLayout } from "@/components/layout/client-layout";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "EduTutor — Nền tảng Quản lý Lớp Gia sư & Tự luyện Toán",
  description:
    "Hệ thống quản lý lớp gia sư, tạo đề thi trực tuyến, tự luyện toán theo chuyên đề, và tính học phí tự động.",
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
