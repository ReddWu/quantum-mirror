import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/navigation";
import { OnboardingGate } from "@/components/onboarding-gate";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
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
    <html lang="en">
      <body className={`${sourceSans.variable} ${sourceSerif.variable}`}>
        <Providers>
          <OnboardingGate>
            <div className="qm-shell">
              <Navigation />
              <main className="qm-page">{children}</main>
              <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
                <div className="mx-auto flex max-w-[1100px] flex-col gap-2 px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p>Quantum Mirror</p>
                  <p>Future-self journaling and daily execution loop.</p>
                </div>
              </footer>
            </div>
          </OnboardingGate>
        </Providers>
      </body>
    </html>
  );
}
