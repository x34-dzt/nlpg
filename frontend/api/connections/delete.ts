import api from "../client"

export async function deleteConnection(connectionId: string): Promise<void> {
  await api.delete(`/connections/${connectionId}`)
}
