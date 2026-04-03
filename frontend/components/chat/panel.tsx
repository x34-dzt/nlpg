"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { getMessages } from "@/api/messages/list"
import { mapToUIMessages } from "@/lib/messages"
import { createChatTransport } from "@/api/messages/chat"
import { ChatMessages } from "@/components/chat/messages"
import { ChatInput } from "@/components/chat/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"

interface ChatPanelProps {
  conversationId: string
  onBack: () => void
}

function ChatInner({
  conversationId,
  initialMessages,
  onBack,
}: {
  conversationId: string
  initialMessages: UIMessage[]
  onBack: () => void
}) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport: createChatTransport(conversationId),
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(text: string) {
    if (!text.trim() || status !== "ready") return
    sendMessage({ text })
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft size={14} />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-primary/10">
            <Sparkles size={11} className="text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">
            AI Assistant
          </span>
        </div>
      </div>
      <Separator />

      <ChatMessages messages={messages} status={status} scrollRef={scrollRef} />

      <Separator />
      <div className="px-3 py-3">
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          disabled={status !== "ready"}
          inputRef={inputRef}
        />
      </div>
    </div>
  )
}

export function ChatPanel({ conversationId, onBack }: ChatPanelProps) {
  const { data: messages, isError } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const data = await getMessages(conversationId)
      return mapToUIMessages(data.items)
    },
  })

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-background">
        <p className="text-sm text-muted-foreground">
          Failed to load messages.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!messages) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <ChatInner
      conversationId={conversationId}
      initialMessages={messages}
      onBack={onBack}
    />
  )
}
