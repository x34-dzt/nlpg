import { PaginatedResponse } from "@/interfaces/pagination"
import { MessageRow } from "@/interfaces/messages"
import api from "@/services/client"

export async function getMessages(
  conversationId: string,
  cursor?: string,
  limit = 50
): Promise<PaginatedResponse<MessageRow>> {
  const params: Record<string, string | number> = { limit }
  if (cursor) params.cursor = cursor
  const res = await api.get<PaginatedResponse<MessageRow>>(
    `/conversations/${conversationId}/messages`,
    { params }
  )
  return res.data
}
