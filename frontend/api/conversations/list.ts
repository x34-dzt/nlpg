import { PaginatedResponse } from "@/interfaces/pagination"
import { Conversation } from "@/interfaces/conversations"
import api from "@/api/client"

export async function listConversations(
  connectionId: string,
  cursor?: string,
  limit = 20
): Promise<PaginatedResponse<Conversation>> {
  const params: Record<string, string | number> = { limit }
  if (cursor) params.cursor = cursor
  const res = await api.get<PaginatedResponse<Conversation>>(
    `/connections/${connectionId}/conversations`,
    { params }
  )
  return res.data
}
