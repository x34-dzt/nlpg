import api from "../client"

interface HealthResponse {
  status: string
  message?: string
}

export async function healthCheck(
  connectionId: string
): Promise<HealthResponse> {
  const res = await api.get<HealthResponse>(
    `/connections/${connectionId}/health`
  )
  return res.data
}
