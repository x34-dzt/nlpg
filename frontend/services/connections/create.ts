import { CreateConnectionRequest, Connection } from "@/interfaces/connections"
import api from "@/services/client"

export async function createConnection(
  data: CreateConnectionRequest
): Promise<Connection> {
  const res = await api.post<Connection>("/connections", data)
  return res.data
}
