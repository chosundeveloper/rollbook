import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2청년부 출석부",
  description: "온라인/오프라인 출석을 한 번에 기록하는 관리 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
