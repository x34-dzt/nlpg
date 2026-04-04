import type { Widget, CreateWidgetRequest } from "@/interfaces/widgets"
import api from "@/api/client"

export async function createWidget(
  connectionId: string,
  data: CreateWidgetRequest
): Promise<Widget> {
  const res = await api.post<Widget>(
    `/connections/${connectionId}/widgets`,
    data
  )
  return res.data
}
