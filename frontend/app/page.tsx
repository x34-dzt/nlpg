"use client"

import { useConnections } from "@/hooks/connections"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { Navbar } from "@/components/layout/navbar"
import { ConnectionCard } from "@/components/connections/connection-card"
import { AddConnectionDialog } from "@/components/connections/add-connection-dialog"
import { Loader2 } from "lucide-react"

export default function ConnectionsPage() {
  const isReady = useRequireAuth()
  const { data, isLoading, isError } = useConnections()

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  const connections = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <AddConnectionDialog />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Failed to load connections.
          </div>
        ) : connections.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">
              No database connections yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click &quot;New&quot; to add one.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {connections.map((conn) => (
              <ConnectionCard key={conn.id} connection={conn} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
