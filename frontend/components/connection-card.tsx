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
  Database,
  Clock,
  MoreVertical,
  Trash2,
  Heart,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function relativeTime(date: string | null): string {
  if (!date) return "Not used yet"
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ConnectionCard({ connection }: { connection: Connection }) {
  const router = useRouter()
  const { mutate: deleteConn, isPending: isDeleting } = useDeleteConnection()
  const { mutate: checkHealth, isPending: isChecking } = useConnectionHealth()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    deleteConn(connection.id, {
      onSuccess: () => {
        toast.success("Connection deleted")
        router.refresh()
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
    <Card className="group relative overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-black/20">
      <CardContent className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <Link href={`/${connection.id}`} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/10 group-hover:bg-primary/10">
              <Database size={14} className="text-primary" />
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
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <MoreVertical size={14} />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={handleHealthCheck}
                disabled={isChecking}
              >
                <Heart size={13} className="mr-2" />
                {isChecking ? "Checking..." : "Health Check"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={13} className="mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/${connection.id}`}>
          <div className="mb-3 space-y-0.5 rounded-md px-0 py-2 font-mono text-xs text-muted-foreground">
            <p className="font-medium text-foreground/70">
              {connection.host}:{connection.port}
            </p>
            <p>{connection.database}</p>
            <p>{connection.username}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} />
              <span>{relativeTime(connection.lastUsedAt)}</span>
            </div>
            <Badge variant={"secondary"} className="h-5 px-1.5 text-[10px]">
              {connection.ssl ? "SSL on" : "SSL off"}
            </Badge>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
