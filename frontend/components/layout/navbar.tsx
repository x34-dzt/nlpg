"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { removeToken, getUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Logout01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export function Navbar() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useMemo(() => getUser(), [])

  function handleLogout() {
    removeToken()
    queryClient.clear()
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tighter">NLP-PG</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="mx-1 h-4 w-px bg-border" />

          <span className="hidden text-xs text-muted-foreground sm:inline">
            {user?.username}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} size={14} />
          </Button>
        </div>
      </div>
    </header>
  )
}
