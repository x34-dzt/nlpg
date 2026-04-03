import { DefaultChatTransport } from "ai"
import { getToken } from "@/lib/auth"
import { API_BASE_URL } from "@/api/client"

export function createChatTransport(conversationId: string) {
  return new DefaultChatTransport({
    api: `${API_BASE_URL}/conversations/${conversationId}/messages/`,
    headers: () => {
      const token = getToken()
      return { Authorization: `Bearer ${token ?? ""}` }
    },
    prepareSendMessagesRequest({ messages }) {
      const lastMessage = messages[messages.length - 1]
      const textPart = lastMessage.parts.find((p) => p.type === "text")
      return {
        body: { content: textPart?.text ?? "" },
      }
    },
  })
}
