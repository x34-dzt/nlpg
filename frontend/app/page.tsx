"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { useConnections } from "@/hooks/connections"
import { Navbar } from "@/components/navbar"
import { ConnectionCard } from "@/components/connection-card"
import { AddConnectionDialog } from "@/components/add-connection-dialog"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function ConnectionsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { data, isLoading, isError } = useConnections()

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  useEffect(() => {
    if (mounted && !getToken()) router.replace("/login")
  }, [router, mounted])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  const token = getToken()
  if (!token) return null

  const connections = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Input
            placeholder="Search databases..."
            className="max-w-xs"
            disabled
          />
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
