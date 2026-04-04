import api from "@/api/client"
import type { Connection } from "@/interfaces/connections"

export async function getConnection(connectionId: string): Promise<Connection> {
  const res = await api.get<Connection>(`/connections/${connectionId}`)
  return res.data
}
