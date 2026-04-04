import { Chat01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function ChatPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
          <HugeiconsIcon
            icon={Chat01Icon}
            strokeWidth={2}
            size={18}
            className="text-muted-foreground"
          />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Select a conversation
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Choose one from the sidebar or create a new one.
        </p>
      </div>
    </div>
  )
}
