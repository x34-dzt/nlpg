import type { UIMessage } from "ai"

export interface MessageRow {
  id: string
  createdAt: string
  updatedAt: string
  role: "user" | "assistant"
  content: UIMessage["parts"]
  conversationId: string
}

export { mapToUIMessages } from "@/lib/messages"
