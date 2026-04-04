"use client"

import { useState } from "react"
import type { ChartType } from "@/lib/chart-detection"
import { useCreateWidget } from "@/hooks/widgets"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const SIZE_PRESETS = [
  { label: "Half", w: 6, h: 4 },
  { label: "Full", w: 12, h: 4 },
  { label: "Tall Half", w: 6, h: 8 },
  { label: "Tall Full", w: 12, h: 8 },
]

const CHART_TYPES: ChartType[] = [
  "bar",
  "line",
  "area",
  "pie",
  "scatter",
  "table",
]

interface SaveWidgetDialogProps {
  connectionId: string
  query: string
  chartType: ChartType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveWidgetDialog({
  connectionId,
  query,
  chartType,
  open,
  onOpenChange,
}: SaveWidgetDialogProps) {
  const [title, setTitle] = useState("")
  const [chartOverride, setChartOverride] = useState<ChartType | null>(null)
  const [sizeOverride, setSizeOverride] = useState<string | null>(null)

  const selectedChartType = chartOverride ?? chartType
  const sizePreset = sizeOverride ?? "0"

  const createWidget = useCreateWidget(connectionId)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setTitle("")
      setChartOverride(null)
      setSizeOverride(null)
    }
    onOpenChange(nextOpen)
  }

  function handleSave() {
    if (!title.trim()) return

    const preset = SIZE_PRESETS[Number(sizePreset)]
    createWidget.mutate(
      {
        title: title.trim(),
        sqlQuery: query,
        chartType: selectedChartType,
        layout: { x: 0, y: 0, w: preset.w, h: preset.h },
      },
      {
        onSuccess: () => {
          toast.success("Widget pinned to dashboard")
          handleOpenChange(false)
        },
        onError: () => {
          toast.error("Failed to pin widget")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pin to Dashboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Widget title"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Chart Type</Label>
            <Select
              value={selectedChartType}
              onValueChange={(v) => setChartOverride(v as ChartType)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Size</Label>
            <Select value={sizePreset} onValueChange={setSizeOverride}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_PRESETS.map((preset, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {preset.label} ({preset.w}×{preset.h})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!title.trim() || createWidget.isPending}
          >
            {createWidget.isPending ? "Saving..." : "Pin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
