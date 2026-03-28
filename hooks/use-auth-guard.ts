"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getAuthSession, isSessionValid } from "@/lib/auth-session"

export function useAuthGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const session = getAuthSession()
    if (!isSessionValid(session)) {
      if (pathname !== "/login") {
        router.replace("/login")
      }
      return
    }
    setReady(true)
  }, [pathname, router])

  return ready
}
