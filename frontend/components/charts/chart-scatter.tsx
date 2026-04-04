"use client"

import {
  Scatter,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ScatterChartCardProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  config: ChartConfig
}

export function ScatterChartCard({
  data,
  xKey,
  yKey,
  config,
}: ScatterChartCardProps) {
  return (
    <ChartContainer config={config} className="min-h-62.5 w-full">
      <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xKey}
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          name={xKey}
        />
        <YAxis
          dataKey={yKey}
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          name={yKey}
        />
        <ZAxis range={[40, 40]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Scatter data={data} fill={`var(--color-${yKey})`} />
      </ScatterChart>
    </ChartContainer>
  )
}
