"use client"

import type { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useLogin, useRegister } from "@/hooks/auth"
import { AuthForm } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const DEMO_CREDS = { username: "demo", password: "demo123456" } as const

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter()
  const { mutate: login, isPending: isLoginPending } = useLogin()
  const { mutate: register, isPending: isRegisterPending } = useRegister()

  const isPending = isLoginPending || isRegisterPending

  function handleDemoLogin() {
    register(DEMO_CREDS, {
      onSuccess: () => {
        router.push("/")
      },
      onError: (registerError) => {
        const msg = (registerError as AxiosError)?.response?.data
          ? ((registerError as AxiosError).response!.data as { message?: string }).message
          : undefined
        if (typeof msg === "string" && msg.includes("already exists")) {
          login(DEMO_CREDS, {
            onSuccess: () => router.push("/"),
            onError: () => {},
          })
        } else {
          toast.error("Failed to sign in as demo user. Please try again.")
        }
      },
    })
  }

  return (
    <div className={className}>
      <AuthForm
        heading="Welcome back"
        description={
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Sign up
            </Link>
          </>
        }
        usernamePlaceholder="Enter your username"
        passwordPlaceholder="Enter your password"
        autoComplete="current-password"
        submitLabel="Login"
        pendingLabel="Signing in..."
        successMessage="Welcome back!"
        onSubmit={(credentials, callbacks) =>
          login(credentials, {
            onSuccess: () => {
              callbacks.onSuccess()
              router.push("/")
            },
            onError: callbacks.onError,
          })
        }
        isPending={isPending}
      />
      <Separator className="my-4" />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isPending}
        onClick={handleDemoLogin}
      >
        Try as Demo
      </Button>
    </div>
  )
}
