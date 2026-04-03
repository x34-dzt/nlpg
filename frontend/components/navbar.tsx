"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { removeToken, getUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Sun, Moon, LogOut } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

export function Navbar({ title }: { title?: string }) {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = getUser()

  function handleLogout() {
    removeToken()
    queryClient.clear()
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tighter">NLP-PG</span>
          </Link>
          {title && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">{title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

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
            <LogOut size={14} />
          </Button>
        </div>
      </div>
    </header>
  )
}
