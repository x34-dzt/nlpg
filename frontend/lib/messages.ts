import type { UIMessage } from "ai"
import type { MessageRow } from "@/interfaces/messages"

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
