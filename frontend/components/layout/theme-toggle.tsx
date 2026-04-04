"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <HugeiconsIcon
        icon={Sun02Icon}
        strokeWidth={2}
        className="size-3.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
      />
      <HugeiconsIcon
        icon={Moon02Icon}
        strokeWidth={2}
        className="absolute size-3.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
      />
    </Button>
  )
}
