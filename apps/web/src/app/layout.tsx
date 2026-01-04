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

export const viewport = {
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
