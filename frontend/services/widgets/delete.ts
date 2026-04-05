import api from "@/services/client"

export async function deleteWidget(
  connectionId: string,
  widgetId: string
): Promise<void> {
  await api.delete(`/connections/${connectionId}/widgets/${widgetId}`)
}
