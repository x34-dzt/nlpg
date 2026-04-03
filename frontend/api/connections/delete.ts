import api from "@/api/client"

export async function deleteConnection(connectionId: string): Promise<void> {
  await api.delete(`/connections/${connectionId}`)
}
