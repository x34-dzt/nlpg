"use client"

import { useMemo } from "react"
import type { ChartType, SqlResult } from "@/lib/chart-detection"
import {
  analyzeColumns,
  getChartConfig,
  getLabelKey,
} from "@/lib/chart-detection"
import { BarChartCard } from "@/components/charts/chart-bar"
import { LineChartCard } from "@/components/charts/chart-line"
import { PieChartCard } from "@/components/charts/chart-pie"
import { AreaChartCard } from "@/components/charts/chart-area"
import { ScatterChartCard } from "@/components/charts/chart-scatter"

interface ChartRendererProps {
  result: SqlResult
  chartType: ChartType
}

export function ChartRenderer({ result, chartType }: ChartRendererProps) {
  const columns = useMemo(() => analyzeColumns(result), [result])
  const config = useMemo(() => getChartConfig(columns), [columns])
  const labelKey = getLabelKey(columns)
  const numericKeys = columns.filter((c) => c.isNumeric).map((c) => c.name)

  const data = useMemo(
    () =>
      result.rows.map((row) => {
        const entry: Record<string, unknown> = {}
        for (const col of columns) {
          const val = row[col.name]
          entry[col.name] = col.isNumeric ? Number(val) || 0 : val
        }
        return entry
      }),
    [result, columns]
  )

  if (chartType === "table" || !labelKey || numericKeys.length === 0) {
    return null
  }

  switch (chartType) {
    case "bar":
      return (
        <BarChartCard
          data={data}
          labelKey={labelKey}
          valueKeys={numericKeys}
          config={config}
        />
      )
    case "line":
      return (
        <LineChartCard
          data={data}
          labelKey={labelKey}
          valueKeys={numericKeys}
          config={config}
        />
      )
    case "area":
      return (
        <AreaChartCard
          data={data}
          labelKey={labelKey}
          valueKeys={numericKeys}
          config={config}
        />
      )
    case "pie":
      return (
        <PieChartCard
          data={data}
          labelKey={labelKey}
          valueKey={numericKeys[0]}
          config={config}
        />
      )
    case "scatter":
      return (
        <ScatterChartCard
          data={data}
          xKey={numericKeys[0]}
          yKey={numericKeys[1] ?? numericKeys[0]}
          config={config}
        />
      )
    default:
      return null
  }
}
