"use client"

import { Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

interface PieChartCardProps {
  data: Record<string, unknown>[]
  labelKey: string
  valueKey: string
  config: ChartConfig
}

export function PieChartCard({
  data,
  labelKey,
  valueKey,
  config,
}: PieChartCardProps) {
  return (
    <ChartContainer
      config={config}
      className="mx-auto min-h-62.5 w-full max-w-[320px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey={labelKey} />} />
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={labelKey}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={40}
          paddingAngle={2}
          strokeWidth={1}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
