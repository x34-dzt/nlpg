"use client"

import { useCallback, useEffect, useRef, useMemo } from "react"
import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout"
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout"
import type { Widget, WidgetResult } from "@/interfaces/widgets"
import { useUpdateLayouts, useDeleteWidget } from "@/hooks/widgets"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { toast } from "sonner"
import "react-grid-layout/css/styles.css"

interface DashboardGridProps {
  connectionId: string
  widgets: Widget[]
  results?: WidgetResult[]
  readOnly?: boolean
}

function toLayoutItem(w: Widget): LayoutItem {
  return { i: w.id, ...w.layout }
}

function toResponsiveLayouts(items: LayoutItem[]): ResponsiveLayouts {
  return { lg: items, md: items, sm: items }
}

export function DashboardGrid({
  connectionId,
  widgets,
  results,
  readOnly = false,
}: DashboardGridProps) {
  const { containerRef, width } = useContainerWidth()
  const updateLayouts = useUpdateLayouts(connectionId)
  const deleteWidget = useDeleteWidget(connectionId)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    },
    []
  )

  const resultsMap = useMemo(
    () => new Map(results?.map((r) => [r.widgetId, r])),
    [results]
  )

  const layouts = useMemo(
    () => toResponsiveLayouts(widgets.map(toLayoutItem)),
    [widgets]
  )

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        updateLayouts.mutate({
          widgets: newLayout.map(({ i, x, y, w, h }) => ({
            id: i,
            layout: { x, y, w, h },
          })),
        })
      }, 200)
    },
    [updateLayouts]
  )

  const handleRemove = useCallback(
    (widgetId: string) => {
      deleteWidget.mutate(widgetId, {
        onSuccess: () => toast.success("Widget removed"),
        onError: () => toast.error("Failed to remove widget"),
      })
    },
    [deleteWidget]
  )

  return (
    <div ref={containerRef} className="w-full">
      {width > 0 && (
        <ResponsiveGridLayout
          width={width}
          breakpoints={{ lg: 1200, md: 768, sm: 0 }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          layouts={layouts}
          rowHeight={80}
          compactor={verticalCompactor}
          dragConfig={{
            enabled: !readOnly,
            handle: ".drag-handle",
            threshold: 3,
          }}
          resizeConfig={{ enabled: !readOnly }}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map((w) => (
            <div key={w.id}>
              <WidgetCard
                title={w.title}
                chartType={w.chartType}
                result={resultsMap.get(w.id)?.result}
                onRemove={readOnly ? undefined : () => handleRemove(w.id)}
                showDragHandle={!readOnly}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
