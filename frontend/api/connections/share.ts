import api from "@/api/client"
import type { ShareResponse } from "@/interfaces/connections"

export async function shareDashboard(
  connectionId: string
): Promise<ShareResponse> {
  const res = await api.post<ShareResponse>(
    `/connections/${connectionId}/share`
  )
  return res.data
}

export async function unshareDashboard(connectionId: string): Promise<void> {
  await api.delete(`/connections/${connectionId}/share`)
}
