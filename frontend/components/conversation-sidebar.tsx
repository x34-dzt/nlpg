"use client"

import { useConversations, useCreateConversation, useDeleteConversation } from "@/hooks/conversations"
import { useConversationStore } from "@/stores/conversation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Loader2, MessageSquare, Clock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AxiosError } from "axios"

function relativeTime(date: string | null): string {
  if (!date) return "Never"
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ConversationSidebar({
  connectionId,
}: {
  connectionId: string
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useConversations(connectionId)
  const { mutate: create, isPending: isCreating } =
    useCreateConversation(connectionId)
  const { mutate: deleteConv, isPending: isDeleting } =
    useDeleteConversation(connectionId)
  const { selectedConversationId, setSelectedConversationId } =
    useConversationStore()

  const conversations = data?.pages.flatMap((p) => p.items) ?? []

  function handleCreate() {
    create(undefined, {
      onSuccess: (conv) => {
        setSelectedConversationId(conv.id)
      },
      onError: (error) => {
        const err = error as AxiosError<{ message: string | string[] }>
        const msg = err.response?.data?.message
        const display = Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Something went wrong"
        toast.error(display)
      },
    })
  }

  function handleDelete(e: React.MouseEvent, conversationId: string) {
    e.stopPropagation()
    deleteConv(conversationId, {
      onSuccess: () => {
        if (selectedConversationId === conversationId) {
          setSelectedConversationId(null)
        }
        toast.success("Conversation deleted")
      },
      onError: () => toast.error("Failed to delete conversation"),
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <span className="text-xs font-medium text-muted-foreground">
          Conversations
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleCreate}
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Plus size={13} />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <MessageSquare
              size={20}
              className="mx-auto mb-2 text-muted-foreground/50"
            />
            <p className="text-xs text-muted-foreground">
              No conversations yet.
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/60">
              Click + to start one.
            </p>
          </div>
        ) : (
          <div className="p-1.5">
            {conversations.map((conv) => {
              const isActive = selectedConversationId === conv.id
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`group mb-0.5 flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <MessageSquare size={11} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs leading-tight font-medium">
                      {conv.id.slice(0, 20)}...
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={9} />
                      <span>
                        {relativeTime(conv.lastUsedAt ?? conv.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    disabled={isDeleting}
                  >
                    <Trash2 size={11} />
                  </button>
                </button>
              )
            })}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full px-3 py-2 text-center text-xs text-muted-foreground hover:text-foreground"
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
