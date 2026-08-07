import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { UploadProvider } from "@/components/UploadProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UR Connection Console",
  description: "작업 영상 기반 숙련도 평가 · 검토 콘솔",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${dmSans.variable} antialiased`}>
        <UploadProvider>{children}</UploadProvider>
      </body>
    </html>
  );
}
