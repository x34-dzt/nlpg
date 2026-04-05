"use client"

import { type KeyboardEvent, useCallback, useState } from "react"
import { ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface ChatInputProps {
  onSubmit: (text: string) => void
  disabled: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}

export function ChatInput({ onSubmit, disabled, inputRef }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setInput("")
  }, [input, disabled, onSubmit])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const canSend = input.trim().length > 0 && !disabled

  return (
    <div className="relative mx-auto max-w-3xl rounded-3xl border border-border bg-input/50 transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your database..."
        disabled={disabled}
        rows={3}
        className="mx-auto field-sizing-content max-h-32 min-h-20 w-full resize-none bg-transparent px-3.5 py-3 pr-10 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="button"
        disabled={!canSend}
        onClick={handleSubmit}
        className="absolute right-1.5 bottom-1.5 flex size-7 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:pointer-events-none disabled:opacity-20"
      >
        <HugeiconsIcon icon={ArrowUp01Icon} size={14} strokeWidth={2.5} />
      </button>
    </div>
  )
}
