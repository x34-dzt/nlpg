import type { UpdateLayoutsRequest } from "@/interfaces/widgets"
import api from "@/api/client"

export async function updateLayouts(
  connectionId: string,
  data: UpdateLayoutsRequest
): Promise<void> {
  await api.patch(`/connections/${connectionId}/widgets/layouts`, data)
}
