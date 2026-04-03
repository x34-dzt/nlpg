"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRegister } from "@/hooks/auth"
import { AuthForm } from "@/components/auth/auth-form"

export function RegisterForm({ className }: { className?: string }) {
  const router = useRouter()
  const { mutate: register, isPending } = useRegister()

  return (
    <AuthForm
      heading="Create an account"
      description={
        <>
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
      usernamePlaceholder="Choose a username"
      passwordPlaceholder="Create a password"
      autoComplete="new-password"
      submitLabel="Sign up"
      pendingLabel="Creating account..."
      successMessage="Account created!"
      onSubmit={(credentials, callbacks) =>
        register(credentials, {
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
