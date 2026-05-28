import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CryptoQuest OS — Tactical Cryptography Simulator",
  description:
    "A story-driven cyber-detective cryptography simulator. Decrypt intercepted messages, solve cipher puzzles, and advance through levels in a premium cyberpunk terminal environment.",
  keywords: ["cryptography", "cipher", "puzzle", "game", "caesar", "hex", "vigenere", "cyberpunk"],
  openGraph: {
    title: "CryptoQuest OS — Tactical Cryptography Simulator",
    description:
      "Decrypt intercepted messages and solve cipher puzzles in this immersive cyberpunk terminal web app.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-zinc-950 text-zinc-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
