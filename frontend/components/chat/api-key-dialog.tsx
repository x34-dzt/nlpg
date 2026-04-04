"use client"

import { useState } from "react"
import { getApiKey, setApiKey, removeApiKey } from "@/lib/api-key"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings02Icon, Key01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function ApiKeyDialog() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setValue(getApiKey() ?? "")
    }
  }

  function handleSave() {
    if (value.trim()) {
      setApiKey(value.trim())
    } else {
      removeApiKey()
    }
    setOpen(false)
  }

  function handleClear() {
    removeApiKey()
    setValue("")
    setOpen(false)
  }

  const hasExisting = !!getApiKey()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
          <HugeiconsIcon
            icon={Settings02Icon}
            strokeWidth={2}
            className="size-3.5"
          />
          API Key
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Key01Icon}
              strokeWidth={2}
              className="size-4"
            />
            API Key
          </DialogTitle>
          <DialogDescription>
            Provide your own OpenRouter API key to use a better model. Without
            this, the free default model is used.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-or-..."
          type="password"
          className="text-sm"
        />
        <DialogFooter>
          {hasExisting && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
