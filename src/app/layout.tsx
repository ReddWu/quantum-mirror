import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantum Mirror",
  description:
    "Future-self chat, multimodal reframe, and action collapse streaks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-zinc-50">
            <Navigation />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            <footer className="border-t border-zinc-200 bg-white">
              <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
                <p className="text-sm text-zinc-600">Powered by Gemini AI · Built with Next.js</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
