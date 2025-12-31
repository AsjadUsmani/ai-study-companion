"use client"

import { useRouter } from "next/navigation"

/**
 * Top-level navigation bar with Home and Dashboard links and a Logout button.
 *
 * Clicking the Logout button sends a POST request to the configured backend `/auth/logout`
 * including credentials, then navigates the user to `/login`.
 *
 * @returns A JSX element containing the navigation links and the Logout button.
 */
export default function Navbar() {
  const router = useRouter()
  const handleLogout = async () => {
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