"use client"

import type { ReactNode } from "react"
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import { useSidebarStore, openSidebar, closeSidebar } from "@/stores/sidebar"

export function SidebarProvider({
  children,
  sidebar,
}: {
  children: ReactNode
  sidebar: ReactNode
}) {
  const isOpen = useSidebarStore.use.isOpen()

  return (
    <div className="flex h-screen bg-background">
      <button
        type="button"
        onClick={openSidebar}
        className="fixed top-3 left-3 z-40 flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground md:hidden"
      >
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} size={18} />
      </button>

      <div className="hidden md:block md:w-72 md:shrink-0 md:border-r md:border-border">
        <div className="h-full">{sidebar}</div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background transition-transform duration-200 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} size={18} />
        </button>
        {sidebar}
      </div>

      <div className="flex-1 overflow-hidden pt-12 md:pt-0">{children}</div>
    </div>
  )
}
