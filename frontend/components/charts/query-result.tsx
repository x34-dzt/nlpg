"use client"

import { memo, useState } from "react"
import { useParams } from "next/navigation"
import type { ChartType, SqlResult } from "@/lib/chart-detection"
import { detectChartType } from "@/lib/chart-detection"
import { formatDuration } from "@/lib/time"
import { ChartRenderer } from "@/components/charts/chart-renderer"
import { DataTable } from "@/components/charts/chart-table"
import { ChartTypeSelector } from "@/components/charts/chart-type-selector"
import { SaveWidgetDialog } from "@/components/dashboard/save-widget-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DatabaseIcon,
  Clock01Icon,
  TableRowsSplitIcon,
  PinIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface QueryResultCardProps {
  result: SqlResult
  query: string
}

export const QueryResultCard = memo(function QueryResultCard({
  result,
  query,
}: QueryResultCardProps) {
  const params = useParams<{ connectionId: string }>()
  const connectionId = params?.connectionId
  const [chartType, setChartType] = useState<ChartType>(() =>
    detectChartType(result)
  )
  const [pinDialogOpen, setPinDialogOpen] = useState(false)

  if (result.error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
        <p className="text-xs font-medium text-destructive">Query Error</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {result.message ?? "Unknown error"}
        </p>
        {result.durationMs != null && (
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            {formatDuration(result.durationMs)}
          </p>
        )}
      </div>
    )
  }

  const columnNames = result.fields.map((f) => f.name)
  const showChart = chartType !== "table"

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2">
        <HugeiconsIcon
          icon={DatabaseIcon}
          strokeWidth={2}
          className="size-3.5 text-muted-foreground"
        />
        <span className="text-sm font-medium text-foreground">
          Query Result
        </span>
        <div className="ml-auto flex items-center gap-2">
          {connectionId && (
            <button
              onClick={() => setPinDialogOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon
                icon={PinIcon}
                strokeWidth={2}
                className="size-3"
              />
              Pin
            </button>
          )}
          {result.durationMs != null && (
            <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
              <HugeiconsIcon
                icon={Clock01Icon}
                strokeWidth={2}
                className="size-2.5"
              />
              {formatDuration(result.durationMs)}
            </Badge>
          )}
          <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-xs">
            <HugeiconsIcon
              icon={TableRowsSplitIcon}
              strokeWidth={2}
              className="size-2.5"
            />
            {result.rowCount ?? result.rows.length}
            {result.truncated ? "+" : ""} rows
          </Badge>
        </div>
      </div>

      <Tabs defaultValue={showChart ? "chart" : "data"} className="w-full">
        <div className="flex items-center justify-between border-b border-border/40 px-3">
          <TabsList variant="line" className="h-8">
            <TabsTrigger value="chart" className="text-xs">
              Chart
            </TabsTrigger>
            <TabsTrigger value="sql" className="text-xs">
              SQL
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              Data
            </TabsTrigger>
          </TabsList>
          <ChartTypeSelector value={chartType} onChange={setChartType} />
        </div>

        <TabsContent value="chart" className="p-3">
          {chartType === "table" ? (
            <DataTable rows={result.rows} columns={columnNames} />
          ) : (
            <ChartRenderer result={result} chartType={chartType} />
          )}
        </TabsContent>

        <TabsContent value="sql" className="p-3">
          <pre className="max-h-60 overflow-auto rounded-xl bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {query}
          </pre>
        </TabsContent>

        <TabsContent value="data" className="max-h-80 overflow-auto p-3">
          <DataTable rows={result.rows} columns={columnNames} />
        </TabsContent>
      </Tabs>

      {connectionId && (
        <SaveWidgetDialog
          connectionId={connectionId}
          query={query}
          chartType={chartType}
          open={pinDialogOpen}
          onOpenChange={setPinDialogOpen}
        />
      )}
    </div>
  )
})
