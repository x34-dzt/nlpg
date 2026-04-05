"use client"

import { useParams } from "next/navigation"
import { useSchema } from "@/hooks/connections"
import { SchemaView } from "@/components/connections/schema-view"
import { DatabaseIcon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function SchemaPage() {
  const params = useParams<{ connectionId: string }>()
  const { data, isLoading, isError, refetch } = useSchema(params.connectionId)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={18}
          strokeWidth={2}
          className="animate-spin text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground/60">Loading schema…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10">
          <HugeiconsIcon
            icon={DatabaseIcon}
            strokeWidth={2}
            size={16}
            className="text-destructive"
          />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Failed to load schema
        </p>
        <p className="text-xs text-muted-foreground/60">
          Could not connect to the database.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-1 text-xs text-primary underline underline-offset-2 hover:text-primary/80"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="h-full overflow-auto">
      <SchemaView schema={data} />
    </div>
  )
}
