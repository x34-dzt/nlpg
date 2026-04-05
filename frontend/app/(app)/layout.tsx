import { AuthGuard, AuthProvider } from "@/components/context/auth"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "NLP-PG",
  description: "NLaaS for postgres",
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  )
}
