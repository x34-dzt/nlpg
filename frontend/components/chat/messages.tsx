"use client"

import { useLayoutEffect } from "react"
import type { UIMessage } from "ai"
import { isToolUIPart } from "ai"
import { Badge } from "@/components/ui/badge"
import Markdown from "react-markdown"
import { Bot, Terminal, Loader2 } from "lucide-react"

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
    </div>
  )
}

function ChatMessage({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%]">
          <div className="rounded-2xl rounded-br-md bg-secondary px-3.5 py-2.5">
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-secondary-foreground">
              {msg.parts
                .filter((p) => p.type === "text")
                .map((p) => (p as { type: "text"; text: string }).text)
                .join("")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
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
              <div key={`${msg.id}-${i}`} className="chat-prose">
                <Markdown>{part.text}</Markdown>
              </div>
            )
          }

          if (part.type === "reasoning") {
            const isStreaming = part.state === "streaming"
            return (
              <details
                key={`${msg.id}-${i}`}
                open={isStreaming}
                className="rounded-lg border border-border/60 bg-muted/30"
              >
                <summary className="cursor-pointer select-none px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  {isStreaming ? "Thinking..." : "Thought process"}
                </summary>
                <div className="border-t border-border/40 px-3 py-2 text-sm leading-relaxed text-muted-foreground chat-prose">
                  <Markdown>{part.text}</Markdown>
                </div>
              </details>
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
                  <Terminal size={12} className="text-muted-foreground" />
                  <span className="text-[12px] font-medium text-foreground">
                    {part.title}
                  </span>
                  <div className="ml-auto">
                    {isRunning && (
                      <Badge
                        variant="secondary"
                        className="h-4 gap-1 px-1.5 py-0 text-[10px]"
                      >
                        <Loader2 size={9} className="animate-spin" />
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
  )
}

interface ChatMessagesProps {
  messages: UIMessage[]
  status: string
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export function ChatMessages({
  messages,
  status,
  scrollRef,
}: ChatMessagesProps) {
  const isStreaming = status === "submitted" || status === "streaming"

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, scrollRef])

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex h-full min-h-75 flex-col items-center justify-center px-6">
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
          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
          {status === "submitted" && (
            <div className="flex items-center gap-2 py-1">
              <TypingDots />
              <span className="text-[12px] text-muted-foreground">
                Sending...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
