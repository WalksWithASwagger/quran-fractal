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
  title: "7430 Project — Quran Fractal",
  description: "Mathematical patterns in the Muqatta'at. 39,349 = 19² × P(29). Don't believe me. Count.",
  keywords: ["Quran", "mathematics", "fractal", "Muqatta'at", "19", "Arabic", "Islamic geometry"],
  authors: [{ name: "7430 Project" }],
  openGraph: {
    title: "7430 Project — Quran Fractal",
    description: "Mathematical patterns in the Muqatta'at. 39,349 = 19² × P(29). Don't believe me. Count.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "7430 Project — Quran Fractal",
    description: "Mathematical patterns in the Muqatta'at. 39,349 = 19² × P(29). Don't believe me. Count.",
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a12]">{children}</body>
    </html>
  );
}
