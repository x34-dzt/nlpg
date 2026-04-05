"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type {
  SchemaInfo,
  SchemaTable,
  SchemaForeignKey,
} from "@/interfaces/connections"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Database02Icon,
  Search01Icon,
  Link01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const TYPE_COLORS: Record<string, string> = {
  integer: "text-blue-600 dark:text-blue-400",
  bigint: "text-blue-600 dark:text-blue-400",
  smallint: "text-blue-600 dark:text-blue-400",
  numeric: "text-emerald-600 dark:text-emerald-400",
  real: "text-emerald-600 dark:text-emerald-400",
  "double precision": "text-emerald-600 dark:text-emerald-400",
  "character varying": "text-violet-600 dark:text-violet-400",
  text: "text-violet-600 dark:text-violet-400",
  boolean: "text-amber-600 dark:text-amber-400",
  "timestamp with time zone": "text-orange-600 dark:text-orange-400",
  "timestamp without time zone": "text-orange-600 dark:text-orange-400",
  date: "text-orange-600 dark:text-orange-400",
}

function getTypeColor(dataType: string): string {
  return TYPE_COLORS[dataType] ?? "text-muted-foreground"
}

function formatDefault(val: string | null): string | null {
  if (!val) return null
  if (val.startsWith("nextval(")) return "auto"
  if (val.startsWith("'")) return val.split("'")[1] ?? val
  return val
}

function getFkTarget(
  fromColumn: string,
  foreignKeys: SchemaForeignKey[]
): SchemaForeignKey | undefined {
  return foreignKeys.find((fk) => fk.fromColumn === fromColumn)
}

function TableCard({
  table,
  foreignKeys,
}: {
  table: SchemaTable
  foreignKeys: SchemaForeignKey[]
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted">
      <div className="border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Database02Icon}
            strokeWidth={2}
            size={13}
            className="text-muted-foreground/60"
          />
          <span className="font-mono text-sm font-semibold tracking-tight">
            {table.tableName}
          </span>
          <Badge
            variant="outline"
            className="ml-auto h-4.5 rounded-md border-border/40 px-1.5 text-[10px] font-medium text-muted-foreground"
          >
            {table.columns.length}
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-border/30 px-1">
        {table.columns.map((col) => {
          const fk = getFkTarget(col.columnName, foreignKeys)
          return (
            <div
              key={col.columnName}
              className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-1.5 transition-colors hover:bg-muted/30"
            >
              <span className="min-w-0 truncate font-mono text-xs text-foreground/90">
                {col.columnName}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[11px] font-medium tabular-nums",
                  getTypeColor(col.dataType)
                )}
              >
                {col.dataType}
              </span>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                {!col.isNullable && (
                  <span className="text-[10px] text-muted-foreground/40">
                    req
                  </span>
                )}
                {formatDefault(col.columnDefault) && (
                  <span className="text-[10px] text-muted-foreground/50">
                    = {formatDefault(col.columnDefault)}
                  </span>
                )}
                {fk && (
                  <span className="flex items-center gap-1 text-[10px] text-primary/70">
                    <HugeiconsIcon
                      icon={Link01Icon}
                      strokeWidth={2}
                      size={10}
                    />
                    {fk.toTable}.{fk.toColumn}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SchemaViewProps {
  schema: SchemaInfo
}

export function SchemaView({ schema }: SchemaViewProps) {
  const [search, setSearch] = useState("")

  const totalColumns = useMemo(
    () => schema.tables.reduce((sum, t) => sum + t.columns.length, 0),
    [schema.tables]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return schema.tables
    const q = search.toLowerCase()
    return schema.tables.filter(
      (t) =>
        t.tableName.toLowerCase().includes(q) ||
        t.columns.some((c) => c.columnName.toLowerCase().includes(q))
    )
  }, [schema.tables, search])

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted/60">
            <HugeiconsIcon
              icon={Database02Icon}
              strokeWidth={2}
              size={16}
              className="text-muted-foreground"
            />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              Database Schema
            </h1>
            <p className="text-xs text-muted-foreground/70">
              {schema.tables.length} tables, {totalColumns} columns
            </p>
          </div>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Filter tables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No tables matching &quot;{search}&quot;
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((table) => (
            <TableCard
              key={table.tableName}
              table={table}
              foreignKeys={schema.foreignKeys}
            />
          ))}
        </div>
      )}
    </div>
  )
}
