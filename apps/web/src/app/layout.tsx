import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Synapse",
    default: "Synapse | Your AI Second Brain",
  },
  description:
    "Transform messy notes into structured knowledge. Synapse uses AI to summarize, quiz, and explain complex topics, acting as the operating system for your studies.",
  keywords: [
    "AI Study",
    "Note Taking",
    "Active Recall",
    "Flashcards",
    "Student Productivity",
  ],
  authors: [{ name: "Asjad Usmani" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#050505" />
      </head>
      <body
      style={{
          margin: 0,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          backgroundColor: '#050505',
          color: '#e5e5e5',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
