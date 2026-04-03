"use client"

import { type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (text: string) => void
  disabled: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  disabled,
  inputRef,
}: ChatInputProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSubmit(input)
    onInputChange("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Ask about your database..."
        disabled={disabled}
        className="flex-1 text-[13px]"
      />
      <Button type="submit" size="icon-sm" disabled={disabled || !input.trim()}>
        <Send size={14} />
      </Button>
    </form>
  )
}
