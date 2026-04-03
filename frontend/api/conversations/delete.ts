import api from "@/api/client"

export async function deleteConversation(
  connectionId: string,
  conversationId: string
): Promise<void> {
  await api.delete(
    `/connections/${connectionId}/conversations/${conversationId}`
  )
}
