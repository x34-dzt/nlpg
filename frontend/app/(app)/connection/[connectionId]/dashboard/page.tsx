"use client"

import { useParams } from "next/navigation"
import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { useWidgets, useWidgetResults } from "@/hooks/widgets"
import {
  useConnection,
  useShareDashboard,
  useUnshareDashboard,
} from "@/hooks/connections"
import {
  DashboardSquare02Icon,
  Share05Icon,
  Copy01Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const params = useParams<{ connectionId: string }>()

  const {
    data: widgets,
    isLoading: widgetsLoading,
    isError,
    refetch: refetchWidgets,
  } = useWidgets(params.connectionId)

  const { data: results, isLoading: resultsLoading } = useWidgetResults(
    params.connectionId,
    !!widgets && widgets.length > 0
  )

  const { data: connection } = useConnection(params.connectionId)
  const shareMutation = useShareDashboard()
  const unshareMutation = useUnshareDashboard()

  const isLoading =
    widgetsLoading || (widgets && widgets.length > 0 && resultsLoading)

  function handleShare() {
    shareMutation.mutate(params.connectionId, {
      onSuccess: (data) => {
        const url = `${window.location.origin}/public/${data.shareToken}`
        navigator.clipboard.writeText(url)
        toast.success("Share link copied to clipboard")
      },
      onError: () => {
        toast.error("Failed to share dashboard")
      },
    })
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/public/${connection?.shareToken}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  function handleUnshare() {
    unshareMutation.mutate(params.connectionId, {
      onSuccess: () => {
        toast.success("Sharing stopped")
      },
      onError: () => {
        toast.error("Failed to stop sharing")
      },
    })
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      {!isLoading && !isError && (
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-2">
            {connection?.shareToken ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-7 gap-1.5 rounded-4xl text-xs"
                >
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} size={13} />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnshare}
                  disabled={unshareMutation.isPending}
                  className="h-7 gap-1.5 rounded-4xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    strokeWidth={2}
                    size={13}
                  />
                  Stop Sharing
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={shareMutation.isPending || !widgets?.length}
                className="h-7 gap-1.5 rounded-4xl text-xs"
              >
                <HugeiconsIcon icon={Share05Icon} strokeWidth={2} size={13} />
                Share
              </Button>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <HugeiconsIcon
            icon={Loading03Icon}
            size={20}
            strokeWidth={2}
            className="animate-spin text-muted-foreground"
          />
        </div>
      )}

      {isError && (
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground">
            Failed to load dashboard widgets.
          </p>
          <button
            onClick={() => refetchWidgets()}
            className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && widgets && widgets.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <HugeiconsIcon
              icon={DashboardSquare02Icon}
              strokeWidth={2}
              size={18}
              className="text-muted-foreground"
            />
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            No widgets yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Pin charts from chat to build your dashboard.
          </p>
        </div>
      )}

      {!isLoading && !isError && widgets && widgets.length > 0 && (
        <DashboardGrid
          connectionId={params.connectionId}
          widgets={widgets}
          results={results}
        />
      )}
    </div>
  )
}
