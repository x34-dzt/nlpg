"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { getMessages } from "@/services/messages/list"
import { mapToUIMessages } from "@/lib/messages"
import { createChatTransport } from "@/services/messages/chat"
import { ChatMessages } from "@/components/chat/messages"
import { ChatInput } from "@/components/chat/input"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useParams } from "next/navigation"

function ChatInner({
  conversationId,
  initialMessages,
}: {
  conversationId: string
  initialMessages: UIMessage[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const params = useParams<{ connectionId: string }>()
  const queryClient = useQueryClient()
  const transport = useMemo(
    () => createChatTransport(conversationId),
    [conversationId]
  )
  const hasInvalidatedTitle = useRef(false)

  const { messages, sendMessage, status, error, clearError } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      queryClient.setQueryData(["messages", conversationId], messages)

      if (!hasInvalidatedTitle.current && params.connectionId) {
        queryClient.invalidateQueries({
          queryKey: ["conversations", params.connectionId],
        })
        hasInvalidatedTitle.current = true
      }
    },
    onError: (err) => {
      console.error("[Chat] Error:", err)
    },
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(
    (text: string) => {
      if (!text.trim() || status !== "ready") return
      sendMessage({ text })
    },
    [status, sendMessage]
  )

  const isDisabled = status !== "ready"

  return (
    <div className="mx-auto flex h-full flex-col">
      <ChatMessages messages={messages} status={status} scrollRef={scrollRef} />
      {error && (
        <div className="flex items-center justify-between px-4 py-2 text-sm text-destructive">
          <span>Something went wrong. Please try again.</span>
          <button
            onClick={clearError}
            className="text-xs underline underline-offset-2 hover:text-destructive/80"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="px-4 py-3">
        <ChatInput
          onSubmit={handleSubmit}
          disabled={isDisabled}
          inputRef={inputRef}
        />
      </div>
    </div>
  )
}

interface ChatPanelProps {
  conversationId: string
}

export function ChatPanel({ conversationId }: ChatPanelProps) {
  const {
    data: messages,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const data = await getMessages(conversationId)
      return mapToUIMessages(data.items)
    },
  })

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          Failed to load messages.
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!messages) {
    return (
      <div className="flex h-full items-center justify-center">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={18}
          strokeWidth={2}
          className="animate-spin text-muted-foreground"
        />
      </div>
    )
  }

  return (
    <ChatInner conversationId={conversationId} initialMessages={messages} />
  )
}
