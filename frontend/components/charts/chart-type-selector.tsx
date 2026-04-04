"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ChartType } from "@/lib/chart-detection"
import {
  BarChartIcon,
  ChartLineData01Icon,
  PieChart02Icon,
  ChartScatterIcon,
  TableIcon,
  ChartAreaIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

const CHART_OPTIONS: {
  value: ChartType
  label: string
  icon: IconSvgElement
}[] = [
  { value: "bar", label: "Bar", icon: BarChartIcon },
  { value: "line", label: "Line", icon: ChartLineData01Icon },
  { value: "area", label: "Area", icon: ChartAreaIcon },
  { value: "pie", label: "Pie", icon: PieChart02Icon },
  { value: "scatter", label: "Scatter", icon: ChartScatterIcon },
  { value: "table", label: "Table", icon: TableIcon },
]

interface ChartTypeSelectorProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

export function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ChartType)}>
      <SelectTrigger size="sm" className="h-7 gap-1.5 rounded-lg px-2 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CHART_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={opt.icon}
                strokeWidth={2}
                className="size-3.5"
              />
              <span>{opt.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
