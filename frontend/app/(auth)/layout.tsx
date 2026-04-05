import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "NLP-PG",
  description: "Sign in or create an account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10"
      style={{
        background:
          "radial-gradient(ellipse 900px 600px at 20% 50%, color-mix(in oklch, var(--primary) 8%, transparent) 0%, transparent 70%), radial-gradient(ellipse 600px 900px at 80% 20%, color-mix(in oklch, var(--primary) 5%, transparent) 0%, transparent 70%)",
      }}
    >
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
