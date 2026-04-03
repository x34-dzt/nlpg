export interface Connection {
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  displayName: string
  host: string
  port: number
  database: string
  username: string
  ssl: boolean
  lastUsedAt: string | null
}

export interface CreateConnectionRequest {
  displayName: string
  host: string
  port?: number
  database: string
  username: string
  password: string
  ssl?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}
