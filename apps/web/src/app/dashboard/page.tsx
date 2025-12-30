"use client";

import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [user, setUser] = useState<null | {userId: string}>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me` || 'http://localhost:5000/user/me', {
      credentials: "include"
    })
    .then(res => {
        if (!res.ok) throw new Error("Not authenticated")
        return res.json()
    })
    .then(data => {
      setUser(data)
    })
    .catch((err) => {
      setUser(null)
    })
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  if (!user) return <p>Please login to access dashboard</p>

  return (
    <div>
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p>User ID: {user.userId}</p>
    </div>
  )
}
