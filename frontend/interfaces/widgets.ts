import type { ChartType, SqlResult } from "@/lib/chart-detection"

interface WidgetLayout {
  x: number
  y: number
  w: number
  h: number
}

interface Widget {
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  connectionId: string
  title: string
  sqlQuery: string
  chartType: ChartType
  layout: WidgetLayout
}

interface CreateWidgetRequest {
  title: string
  sqlQuery: string
  chartType: ChartType
  layout?: WidgetLayout
}

interface UpdateWidgetRequest {
  title?: string
  chartType?: ChartType
  layout?: WidgetLayout
}

interface UpdateLayoutsRequest {
  widgets: Array<{ id: string; layout: WidgetLayout }>
}

interface WidgetResult {
  widgetId: string
  result: SqlResult
}

export type {
  Widget,
  WidgetLayout,
  CreateWidgetRequest,
  UpdateWidgetRequest,
  UpdateLayoutsRequest,
  WidgetResult,
}
