import api from "@/services/client"
import type { PublicDashboard } from "@/interfaces/connections"

export async function getPublicDashboard(
  token: string
): Promise<PublicDashboard> {
  const res = await api.get<PublicDashboard>(`/public/dashboard/${token}`)
  return res.data
}
