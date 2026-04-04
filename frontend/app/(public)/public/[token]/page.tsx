"use client"

import { useParams } from "next/navigation"
import { usePublicDashboard } from "@/hooks/public"
import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

export default function PublicDashboardPage() {
  const params = useParams<{ token: string }>()
  const { data, isLoading, isError } = usePublicDashboard(params.token)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={20}
          strokeWidth={2}
          className="animate-spin text-muted-foreground"
        />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background">
        <HugeiconsIcon
          icon={DashboardSquare02Icon}
          strokeWidth={2}
          size={24}
          className="text-muted-foreground"
        />
        <p className="text-sm text-muted-foreground">
          Dashboard not found or sharing has been disabled.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={DashboardSquare02Icon}
              strokeWidth={2}
              size={18}
              className="text-muted-foreground"
            />
            <span className="text-sm font-medium text-foreground">
              {data.connection.displayName}
            </span>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            Shared Dashboard
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {data.widgets.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <HugeiconsIcon
              icon={DashboardSquare02Icon}
              strokeWidth={2}
              size={20}
              className="text-muted-foreground"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              This dashboard has no widgets.
            </p>
          </div>
        ) : (
          <DashboardGrid
            connectionId={data.widgets[0].connectionId}
            widgets={data.widgets}
            results={data.results}
            readOnly
          />
        )}
      </div>
    </div>
  )
}
