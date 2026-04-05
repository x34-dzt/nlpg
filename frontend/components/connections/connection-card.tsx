"use client"

import { useState } from "react"
import Link from "next/link"
import type { Connection } from "@/interfaces/connections"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteConnection, useConnectionHealth } from "@/hooks/connections"
import {
  DatabaseIcon,
  MoreVerticalIcon,
  Delete02Icon,
  FavouriteIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

export function ConnectionCard({ connection }: { connection: Connection }) {
  const { mutate: deleteConn, isPending: isDeleting } = useDeleteConnection()
  const { mutate: checkHealth, isPending: isChecking } = useConnectionHealth()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    deleteConn(connection.id, {
      onSuccess: () => {
        toast.success("Connection deleted")
      },
      onError: () => toast.error("Failed to delete connection"),
    })
  }

  function handleHealthCheck(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    checkHealth(connection.id, {
      onSuccess: (data) => {
        if (data.status === "ok") {
          toast.success("Connection healthy")
        } else {
          toast.error(`Connection issue: ${data.message}`)
        }
      },
      onError: () => toast.error("Health check failed"),
    })
  }

  return (
    <Card className="group relative overflow-hidden py-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-black/20">
      <CardContent className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href={`/connection/${connection.id}`}
            className="flex items-center gap-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 group-hover:bg-primary/10">
              <HugeiconsIcon
                icon={DatabaseIcon}
                strokeWidth={2}
                size={14}
                className="text-primary"
              />
            </div>
            <span className="text-sm font-semibold">
              {connection.displayName}
            </span>
          </Link>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
              >
                {isDeleting ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    strokeWidth={2}
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={MoreVerticalIcon}
                    strokeWidth={2}
                    size={14}
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={handleHealthCheck}
                disabled={isChecking}
              >
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  strokeWidth={2}
                  size={13}
                  className="mr-2"
                />
                {isChecking ? "Checking..." : "Health Check"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  strokeWidth={2}
                  size={13}
                  className="mr-2"
                />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/connection/${connection.id}`}>
          <div className="mb-3 space-y-0.5 rounded-md px-0 py-2 font-mono text-xs text-muted-foreground">
            <p className="font-medium text-foreground/70">
              {connection.host}:{connection.port}
            </p>
            <p>{connection.database}</p>
            <p>{connection.username}</p>
          </div>

          <Badge variant={"secondary"} className="h-5 px-1.5 text-xs">
            {connection.ssl ? "SSL on" : "SSL off"}
          </Badge>
        </Link>
      </CardContent>
    </Card>
  )
}
