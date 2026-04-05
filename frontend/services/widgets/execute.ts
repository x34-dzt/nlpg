import type { WidgetResult } from "@/interfaces/widgets"
import api from "@/services/client"

export async function executeWidgets(
  connectionId: string
): Promise<WidgetResult[]> {
  const res = await api.post<WidgetResult[]>(
    `/connections/${connectionId}/widgets/execute`
  )
  return res.data
}
