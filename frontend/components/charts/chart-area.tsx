"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface AreaChartCardProps {
  data: Record<string, unknown>[]
  labelKey: string
  valueKeys: string[]
  config: ChartConfig
}

export function AreaChartCard({
  data,
  labelKey,
  valueKeys,
  config,
}: AreaChartCardProps) {
  return (
    <ChartContainer config={config} className="min-h-62.5 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {valueKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            fill={`var(--color-${key})`}
            fillOpacity={0.15 + i * 0.05}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}
