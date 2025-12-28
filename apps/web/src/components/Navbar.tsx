"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="flex gap-6 items-center p-4 border-b">
      <Link href="/" className="font-semibold">
        AI Study Companion
      </Link>

      <Link href="/dashboard">Dashboard</Link>
      <Link href="/login" className="ml-auto">Login</Link>
    </nav>
  )
}
