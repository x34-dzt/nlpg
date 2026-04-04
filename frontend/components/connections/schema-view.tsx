"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type {
  SchemaInfo,
  SchemaTable,
  SchemaForeignKey,
} from "@/interfaces/connections"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, Database02Icon } from "@hugeicons/core-free-icons"
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

function ForeignKeyLinks({ foreignKeys }: { foreignKeys: SchemaForeignKey[] }) {
  if (foreignKeys.length === 0) return null

  return (
    <div className="mt-3 border-t border-border/40 pt-2 pb-2">
      <span className="block px-2 pb-1.5 text-xs font-medium text-muted-foreground/60">
        References
      </span>
      {foreignKeys.map((fk, i) => (
        <div
          key={`${fk.fromColumn}-${fk.toTable}-${fk.toColumn}-${i}`}
          className="flex items-center gap-3 px-2 py-1.5 transition-colors hover:bg-muted/40"
        >
          <span className="min-w-[110px] font-mono text-xs text-foreground/80">
            {fk.fromColumn}
          </span>
          <HugeiconsIcon
            icon={ArrowRightIcon}
            strokeWidth={2}
            className="size-3 shrink-0 text-muted-foreground/40"
          />
          <span className="font-mono text-xs text-muted-foreground">
            {fk.toTable}.{fk.toColumn}
          </span>
        </div>
      ))}
    </div>
  )
}

function TableSection({
  table,
  foreignKeys,
}: {
  table: SchemaTable
  foreignKeys: SchemaForeignKey[]
}) {
  const tableFKs = foreignKeys.filter((fk) => fk.fromTable === table.tableName)

  return (
    <AccordionItem
      value={table.tableName}
      className="border-b border-border/40 last:border-b-0"
    >
      <AccordionTrigger className="py-3 hover:no-underline">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium tracking-tight">
            {table.tableName}
          </span>
          <Badge
            variant="outline"
            className="h-4.5 rounded-md border-border/40 px-1.5 text-[10px] font-medium text-muted-foreground"
          >
            {table.columns.length}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0.5 pb-4">
        <div className="ml-2 space-y-px">
          {table.columns.map((col) => (
            <div
              key={col.columnName}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/40"
            >
              <span className="min-w-[110px] font-mono text-sm text-foreground/90">
                {col.columnName}
              </span>
              <span
                className={cn(
                  "text-xs font-medium tabular-nums",
                  getTypeColor(col.dataType)
                )}
              >
                {col.dataType}
              </span>
              <div className="flex items-center gap-2">
                {col.isNullable && (
                  <span className="text-[11px] text-muted-foreground/60">
                    null
                  </span>
                )}
                {!col.isNullable && (
                  <span className="text-[11px] text-muted-foreground/40">
                    not null
                  </span>
                )}
                {formatDefault(col.columnDefault) && (
                  <span className="text-[11px] text-muted-foreground/50">
                    = {formatDefault(col.columnDefault)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="ml-2">
          <ForeignKeyLinks foreignKeys={tableFKs} />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

interface SchemaViewProps {
  schema: SchemaInfo
}

export function SchemaView({ schema }: SchemaViewProps) {
  const totalColumns = useMemo(
    () => schema.tables.reduce((sum, t) => sum + t.columns.length, 0),
    [schema.tables]
  )

  return (
    <div className="mx-auto max-w-3xl space-y-5">
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

      <div className="overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
        <Accordion
          type="multiple"
          defaultValue={schema.tables.map((t) => t.tableName)}
        >
          {schema.tables.map((table) => (
            <TableSection
              key={table.tableName}
              table={table}
              foreignKeys={schema.foreignKeys}
            />
          ))}
        </Accordion>
      </div>
    </div>
  )
}
