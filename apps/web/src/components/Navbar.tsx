"use client"

import { useRouter } from "next/navigation"

export default function Navbar() {
  const handleLogout = async () => {
    const router = useRouter()
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout` ||"http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    router.push("/login")
  }
  return (
    <nav className="flex gap-6 p-4 border-b">
      <a href="/">Home</a>
      <a href="/dashboard">Dashboard</a>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  )
}
