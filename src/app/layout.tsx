import type { Metadata, Viewport } from "next";
import { Kosugi_Maru } from "next/font/google";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

const kosugiMaru = Kosugi_Maru({
  variable: "--font-kosugi-maru",
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  title: "自己観察アプリ",
  description: "日々の思考・感情・行動を記録する",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${kosugiMaru.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-[#f0ede6] pb-[calc(56px+env(safe-area-inset-bottom))]">
<main className="mx-auto w-full max-w-md px-4 py-5">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
