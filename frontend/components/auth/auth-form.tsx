"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { extractErrorMessage } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/auth/password-input"
import { toast } from "sonner"

interface AuthFormProps {
  heading: string
  description: React.ReactNode
  usernamePlaceholder: string
  passwordPlaceholder: string
  autoComplete: string
  submitLabel: string
  pendingLabel: string
  successMessage: string
  onSubmit: (
    credentials: { username: string; password: string },
    callbacks: {
      onSuccess: () => void
      onError: (error: unknown) => void
    }
  ) => void
  isPending: boolean
  className?: string
}

export function AuthForm({
  heading,
  description,
  usernamePlaceholder,
  passwordPlaceholder,
  autoComplete,
  submitLabel,
  pendingLabel,
  successMessage,
  onSubmit,
  isPending,
  className,
}: AuthFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(
      { username, password },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (error) => toast.error(extractErrorMessage(error)),
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">{heading}</h1>
            <FieldDescription>{description}</FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder={usernamePlaceholder}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              autoComplete="username"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder={passwordPlaceholder}
              autoComplete={autoComplete}
            />
          </Field>
          <Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
