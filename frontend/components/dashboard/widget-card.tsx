"use client"

import { memo } from "react"
import type { ChartType, SqlResult } from "@/lib/chart-detection"
import { formatDuration } from "@/lib/time"
import { ChartRenderer } from "@/components/charts/chart-renderer"
import { DataTable } from "@/components/charts/chart-table"
import { Badge } from "@/components/ui/badge"
import {
  Cancel01Icon,
  Clock01Icon,
  TableRowsSplitIcon,
  DragIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface WidgetCardProps {
  title: string
  chartType: ChartType
  result?: SqlResult
  onRemove?: () => void
  showDragHandle?: boolean
}

export const WidgetCard = memo(function WidgetCard({
  title,
  chartType,
  result,
  onRemove,
  showDragHandle = true,
}: WidgetCardProps) {
  const columnNames = result?.fields.map((f) => f.name) ?? []

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div
        className={`flex items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2 ${showDragHandle ? "drag-handle cursor-grab" : ""}`}
      >
        {showDragHandle && (
          <HugeiconsIcon
            icon={DragIcon}
            strokeWidth={2}
            className="size-3.5 text-muted-foreground/50"
          />
        )}
        <span className="truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {result?.durationMs != null && (
            <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
              <HugeiconsIcon
                icon={Clock01Icon}
                strokeWidth={2}
                className="size-2.5"
              />
              {formatDuration(result.durationMs)}
            </Badge>
          )}
          {result && (
            <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
              <HugeiconsIcon
                icon={TableRowsSplitIcon}
                strokeWidth={2}
                className="size-2.5"
              />
              {result.rowCount ?? result.rows.length}
              {result.truncated ? "+" : ""}
            </Badge>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="inline-flex items-center justify-center rounded-lg p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="size-3.5"
              />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {!result && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        )}
        {result?.error && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-destructive">
              {result.message ?? "Query error"}
            </p>
          </div>
        )}
        {result && !result.error && (
          <>
            {chartType === "table" ? (
              <DataTable rows={result.rows} columns={columnNames} />
            ) : (
              <ChartRenderer result={result} chartType={chartType} />
            )}
          </>
        )}
      </div>
    </div>
  )
})
