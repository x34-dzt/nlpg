"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface BarChartCardProps {
  data: Record<string, unknown>[]
  labelKey: string
  valueKeys: string[]
  config: ChartConfig
}

export function BarChartCard({
  data,
  labelKey,
  valueKeys,
  config,
}: BarChartCardProps) {
  return (
    <ChartContainer config={config} className="min-h-62.5 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 48, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {valueKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
