export interface Conversation {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  connectionId: string
  lastUsedAt: string | null
}
