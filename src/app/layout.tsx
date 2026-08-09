import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { UploadProvider } from "@/components/UploadProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "UR Connection Console",
  description: "작업 영상 기반 숙련도 평가 · 검토 콘솔",
  icons: {
    icon: [
      { url: `${basePath}/favicon.svg`, type: "image/svg+xml" },
      { url: `${basePath}/favicon.png`, type: "image/png", sizes: "32x32" },
    ],
    shortcut: `${basePath}/favicon.png`,
    apple: [{ url: `${basePath}/apple-touch-icon.png`, sizes: "180x180" }],
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
