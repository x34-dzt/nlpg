import { DefaultChatTransport } from "ai"
import { getToken } from "@/lib/auth"
import { getApiKey } from "@/lib/api-key"
import { API_BASE_URL } from "@/services/client"

export function createChatTransport(conversationId: string) {
  return new DefaultChatTransport({
    api: `${API_BASE_URL}/conversations/${conversationId}/messages/`,
    headers: () => {
      const token = getToken()
      const apiKey = getApiKey()
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token ?? ""}`,
      }
      if (apiKey) {
        headers["X-AI-API-Key"] = apiKey
      }
      return headers
    },
    prepareSendMessagesRequest({ messages }) {
      const lastMessage = messages[messages.length - 1]
      const textPart = lastMessage.parts.find((p) => p.type === "text")
      return {
        body: {
          content: textPart?.text ?? "",
          clientMessageId: lastMessage.id,
        },
      }
    },
  })
}
