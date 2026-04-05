import type { Widget } from "@/interfaces/widgets"
import api from "@/services/client"

export async function listWidgets(connectionId: string): Promise<Widget[]> {
  const res = await api.get<Widget[]>(`/connections/${connectionId}/widgets`)
  return res.data
}
