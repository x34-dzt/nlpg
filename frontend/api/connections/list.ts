import { PaginatedResponse, Connection } from "@/interfaces/connections"
import api from "@/api/client"

export async function listConnections(
  cursor?: string,
  limit = 20,
  search?: string,
): Promise<PaginatedResponse<Connection>> {
  const params: Record<string, string | number> = { limit }
  if (cursor) params.cursor = cursor
  if (search) params.search = search
  const res = await api.get<PaginatedResponse<Connection>>("/connections", {
    params,
  })
  return res.data
}
