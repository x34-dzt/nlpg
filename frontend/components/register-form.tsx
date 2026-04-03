"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRegister } from "@/hooks/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { Eye, EyeOff } from "lucide-react"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { mutate: register, isPending } = useRegister()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    register(
      { username, password },
      {
        onSuccess: () => {
          toast.success("Account created!")
          router.push("/")
        },
        onError: (error) => {
          const err = error as AxiosError<{ message: string | string[] }>
          const msg = err.response?.data?.message
          const display = Array.isArray(msg)
            ? msg.join(", ")
            : msg || "Something went wrong"
          toast.error(display)
        },
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Create an account</h1>
            <FieldDescription>
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              autoComplete="username"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Sign up"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
