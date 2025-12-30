"use client"

import Link from "next/link"

export default function Navbar() {
  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout` ||"http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    console.log(window.location);
    window.location.pathname = "/login"
  }
  return (
    <nav className="flex gap-6 p-4 border-b">
      <a href="/">Home</a>
      <a href="/dashboard">Dashboard</a>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  )
}
