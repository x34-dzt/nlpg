"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface LineChartCardProps {
  data: Record<string, unknown>[]
  labelKey: string
  valueKeys: string[]
  config: ChartConfig
}

export function LineChartCard({
  data,
  labelKey,
  valueKeys,
  config,
}: LineChartCardProps) {
  return (
    <ChartContainer config={config} className="min-h-62.5 w-full">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
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
        {valueKeys.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={data.length <= 20}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}
