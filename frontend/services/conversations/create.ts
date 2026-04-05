import { Conversation } from "@/interfaces/conversations"
import api from "@/services/client"

export async function createConversation(
  connectionId: string
): Promise<Conversation> {
  const res = await api.post<Conversation>(
    `/connections/${connectionId}/conversations`
  )
  return res.data
}
