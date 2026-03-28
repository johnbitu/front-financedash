"use client"

import { useEffect, useState } from "react"
import { getAuthSession, type AuthSession } from "@/lib/auth-session"

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    setSession(getAuthSession())

    const onStorage = () => setSession(getAuthSession())
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return session
}
