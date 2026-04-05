import api from "@/services/client"
import type { HealthResponse } from "@/interfaces/connections"

export async function healthCheck(
  connectionId: string
): Promise<HealthResponse> {
  const res = await api.get<HealthResponse>(
    `/connections/${connectionId}/health`
  )
  return res.data
}
