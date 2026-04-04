import type { Widget, WidgetResult } from "@/interfaces/widgets"

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
  shareToken: string | null
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

export interface HealthResponse {
  status: string
  message?: string
}

export interface SchemaColumn {
  columnName: string
  dataType: string
  isNullable: boolean
  columnDefault: string | null
}

export interface SchemaTable {
  tableName: string
  columns: SchemaColumn[]
}

export interface SchemaForeignKey {
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
}

export interface SchemaInfo {
  tables: SchemaTable[]
  foreignKeys: SchemaForeignKey[]
}

export interface ShareResponse {
  shareToken: string
}

export interface PublicDashboard {
  connection: { displayName: string }
  widgets: Widget[]
  results: WidgetResult[]
}

export type { PaginatedResponse } from "@/interfaces/pagination"
