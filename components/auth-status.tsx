"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "authenticated") {
    return (
      <div className="bg-green-100 p-4 rounded-md">
        <p className="font-medium">Signed in as {session.user?.name}</p>
        <p className="text-sm text-gray-600 mb-2">Email: {session.user?.email}</p>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-yellow-100 p-4 rounded-md">
      <p>Not signed in</p>
    </div>
  )
}
