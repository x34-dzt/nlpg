import type { UIMessage } from "ai"

export interface MessageRow {
  id: string
  createdAt: string
  updatedAt: string
  role: "user" | "assistant"
  content: UIMessage["parts"]
  conversationId: string
}

export function mapToUIMessages(rows: MessageRow[]): UIMessage[] {
  return rows
    .slice()
    .reverse()
    .map((row) => ({
      id: row.id,
      role: row.role,
      parts: row.content,
      createdAt: new Date(row.createdAt),
    }))
}
