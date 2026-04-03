"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isToolUIPart } from "ai"
import type { UIMessage } from "ai"
import { getMessages } from "@/api/messages/list"
import { mapToUIMessages } from "@/interfaces/messages"
import { getToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Markdown from "react-markdown"
import { ArrowLeft, Send, Loader2, Bot, Sparkles, Terminal } from "lucide-react"

interface ChatPanelProps {
  conversationId: string
  onBack: () => void
}

interface ChatInnerProps {
  conversationId: string
  initialMessages: UIMessage[]
  onBack: () => void
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
    </div>
  )
}

function ChatInner({
  conversationId,
  initialMessages,
  onBack,
}: ChatInnerProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/conversations/${conversationId}/messages/`,
      headers: () => {
        const token = getToken()
        return { Authorization: `Bearer ${token ?? ""}` }
      },
      prepareSendMessagesRequest({ messages }) {
        const lastMessage = messages[messages.length - 1]
        const textPart = lastMessage.parts.find((p) => p.type === "text")
        return {
          body: { content: textPart?.text ?? "" },
        }
      },
    }),
  })

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return
    sendMessage({ text: input })
    setInput("")
  }

  const isStreaming = status === "submitted" || status === "streaming"

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
        <Separator orientation="vertical" className="h-3.5" />
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

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Bot size={20} className="text-primary" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              Ask anything about your database
            </p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Query tables, explore schemas, or analyze data.
            </p>
          </div>
        ) : (
          <div className="space-y-1 px-4 py-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user"

              return (
                <div key={msg.id} className={isUser ? "flex justify-end" : ""}>
                  <div className={isUser ? "max-w-[85%]" : ""}>
                    {isUser ? (
                      <div className="rounded-2xl rounded-br-md bg-secondary px-3.5 py-2.5">
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-secondary-foreground">
                          {msg.parts
                            .filter((p) => p.type === "text")
                            .map(
                              (p) => (p as { type: "text"; text: string }).text
                            )
                            .join("")}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2.5 py-1">
                        <div className="mt-0.5 shrink-0">
                          <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10">
                            <Bot size={13} className="text-primary" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          {msg.parts.map((part, i) => {
                            if (part.type === "text") {
                              return (
                                <div
                                  key={`${msg.id}-${i}`}
                                  className="chat-prose"
                                >
                                  <Markdown>{part.text}</Markdown>
                                </div>
                              )
                            }

                            if (isToolUIPart(part)) {
                              const isDone = part.state === "output-available"
                              const isRunning =
                                part.state === "input-streaming" ||
                                part.state === "input-available"

                              return (
                                <div
                                  key={`${msg.id}-${i}`}
                                  className="overflow-hidden rounded-xl border border-border bg-muted/40"
                                >
                                  <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-2">
                                    <Terminal
                                      size={12}
                                      className="text-muted-foreground"
                                    />
                                    <span className="text-[12px] font-medium text-foreground">
                                      {part.title}
                                    </span>
                                    <div className="ml-auto">
                                      {isRunning && (
                                        <Badge
                                          variant="secondary"
                                          className="h-4 gap-1 px-1.5 py-0 text-[10px]"
                                        >
                                          <Loader2
                                            size={9}
                                            className="animate-spin"
                                          />
                                          running
                                        </Badge>
                                      )}
                                      {isDone && (
                                        <Badge
                                          variant="outline"
                                          className="h-4 border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                        >
                                          done
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {isDone && part.output != null && (
                                    <pre className="max-h-40 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                                      {typeof part.output === "string"
                                        ? part.output
                                        : JSON.stringify(part.output, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              )
                            }

                            return null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {isStreaming && (
              <div className="flex items-center gap-2.5 py-1">
                <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10">
                  <Bot size={13} className="text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <TypingDots />
                  <span className="text-[12px] text-muted-foreground">
                    {status === "submitted" ? "Sending..." : "Thinking"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Separator />
      <div className="px-3 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your database..."
            disabled={status !== "ready"}
            className="flex-1 text-[13px]"
          />
          <Button
            type="submit"
            size="icon-sm"
            disabled={status !== "ready" || !input.trim()}
          >
            <Send size={14} />
          </Button>
        </form>
      </div>
    </div>
  )
}

export function ChatPanel({ conversationId, onBack }: ChatPanelProps) {
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(
    null
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getMessages(conversationId)
        if (!cancelled) setInitialMessages(mapToUIMessages(data.items))
      } catch {
        if (!cancelled) setInitialMessages([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [conversationId])

  if (initialMessages === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <ChatInner
      conversationId={conversationId}
      initialMessages={initialMessages}
      onBack={onBack}
    />
  )
}
