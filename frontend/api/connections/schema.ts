import api from "@/api/client"
import type { SchemaInfo } from "@/interfaces/connections"

export async function getConnectionSchema(
  connectionId: string
): Promise<SchemaInfo> {
  const res = await api.get<SchemaInfo>(`/connections/${connectionId}/schema`)
  return res.data
}
