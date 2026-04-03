"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLogin } from "@/hooks/auth"
import { AuthForm } from "@/components/auth/auth-form"

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter()
  const { mutate: login, isPending } = useLogin()

  return (
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
      className={className}
    />
  )
}
