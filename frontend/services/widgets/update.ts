import type { Widget, UpdateWidgetRequest } from "@/interfaces/widgets"
import api from "@/services/client"

export async function updateWidget(
  connectionId: string,
  widgetId: string,
  data: UpdateWidgetRequest
): Promise<Widget> {
  const res = await api.patch<Widget>(
    `/connections/${connectionId}/widgets/${widgetId}`,
    data
  )
  return res.data
}
