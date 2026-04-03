import { useEffect, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"

const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function useRequireAuth(): boolean {
  const router = useRouter()
  const isMounted = useIsMounted()
  const token = isMounted ? getToken() : null

  useEffect(() => {
    if (isMounted && !token) {
      router.replace("/login")
    }
  }, [router, isMounted, token])

  return isMounted && !!token
}
