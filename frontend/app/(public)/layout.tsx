import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "NLP-PG — Shared Dashboard",
  description: "View a shared dashboard",
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
