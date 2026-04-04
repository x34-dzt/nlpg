export interface Conversation {
  id: string
  title: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  connectionId: string
  lastUsedAt: string | null
}
