"use client"

import { memo, useCallback, useState } from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
} from "@/hooks/conversations"
import { extractErrorMessage } from "@/lib/api-error"
import { relativeTime } from "@/lib/time"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ApiKeyDialog } from "@/components/chat/api-key-dialog"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import {
  PencilEdit02Icon,
  Clock01Icon,
  Cancel01Icon,
  Chat01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { closeSidebar } from "@/stores/sidebar"

interface ConversationSidebarProps {
  connectionId: string
}

export const ConversationSidebar = memo(function ConversationSidebar({
  connectionId,
}: ConversationSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams<{
    connectionId: string
    conversationId?: string
  }>()

  const activeConvId = params.conversationId ?? null

  const isDashboard = pathname.includes("dashboard")
  const isSchema = pathname.includes("schema")

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useConversations(connectionId)
  const { mutate: create, isPending: isCreating } = useCreateConversation()
  const { mutate: deleteConv } = useDeleteConversation(connectionId)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const conversations = data?.pages.flatMap((p) => p.items) ?? []

  const handleCreate = useCallback(() => {
    create(connectionId, {
      onSuccess: (conv) => {
        router.push(`/connection/${connectionId}/${conv.id}`)
        closeSidebar()
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error))
      },
    })
  }, [create, router, connectionId])

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-3 pb-2">
        <Link href="/" className="text-sm font-bold tracking-tighter">
          NLP-PG
        </Link>
      </div>

      <div className="mt-2 px-3 pb-2">
        <div className="flex h-8 items-center rounded-full bg-muted p-0.5">
          <Link
            href={`/connection/${connectionId}/dashboard`}
            onClick={closeSidebar}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-full py-1 text-sm font-medium transition-colors",
              isDashboard
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link
            href={`/connection/${connectionId}/schema`}
            onClick={closeSidebar}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-full py-1 text-sm font-medium transition-colors",
              isSchema
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Schema
          </Link>
        </div>
      </div>

      <div className="py-2">
        <div className="flex items-center px-3 pb-2">
          <Button
            variant={"secondary"}
            className="flex w-full items-center justify-start gap-2 text-sm"
            onClick={handleCreate}
            disabled={isCreating}
          >
            <HugeiconsIcon
              icon={PencilEdit02Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            New Chat
          </Button>
        </div>

        <span className="px-3 text-xs font-medium text-muted-foreground">
          Conversations
        </span>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <HugeiconsIcon
              icon={Clock01Icon}
              strokeWidth={2}
              size={16}
              className="animate-spin text-muted-foreground"
            />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <HugeiconsIcon
              icon={Chat01Icon}
              strokeWidth={2}
              size={20}
              className="mx-auto mb-2 text-muted-foreground/50"
            />
            <p className="text-sm text-muted-foreground">
              No conversations yet.
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/60">
              Click + to start one.
            </p>
          </div>
        ) : (
          <div className="px-2 pb-2">
            {conversations.map((conv) => {
              const isActive = activeConvId === conv.id
              return (
                <Link
                  href={`/connection/${connectionId}/${conv.id}`}
                  onClick={closeSidebar}
                  key={conv.id}
                  className={cn(
                    "group mb-0.5 flex w-full items-center rounded-lg px-2.5 py-1.5 text-left transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50"
                  )}
                >
                  <p className="min-w-0 flex-1 truncate text-sm leading-tight font-medium">
                    {conv.title
                      ? conv.title?.length > 20
                        ? `${conv.title.slice(0, 20)}...`
                        : conv.title
                      : "Untitled"}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span
                        onClick={(e) => e.stopPropagation()}
                        className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
                      >
                        <HugeiconsIcon
                          icon={MoreHorizontalIcon}
                          strokeWidth={2}
                          size={14}
                        />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      <DropdownMenuItem
                        className="text-xs text-muted-foreground"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                        {relativeTime(conv.lastUsedAt ?? conv.createdAt)}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingId(conv.id)
                          deleteConv(conv.id, {
                            onSuccess: () => {
                              if (activeConvId === conv.id) {
                                router.push(`/connection/${connectionId}`)
                              }
                              toast.success("Conversation deleted")
                              setDeletingId(null)
                            },
                            onError: () => {
                              toast.error("Failed to delete conversation")
                              setDeletingId(null)
                            },
                          })
                        }}
                        disabled={deletingId === conv.id}
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Link>
              )
            })}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full px-3 py-2 text-center text-sm text-muted-foreground hover:text-foreground"
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        )}
      </ScrollArea>

      <Separator />
      <div className="flex items-center justify-between px-3 py-2">
        <ApiKeyDialog />
        <ThemeToggle />
      </div>
    </div>
  )
})
