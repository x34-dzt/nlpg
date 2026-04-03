"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getToken } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { ConversationSidebar } from "@/components/conversation-sidebar"
import { ChatPanel } from "@/components/chat-panel"
import { useConversationStore } from "@/stores/conversation"
import { Construction, Loader2 } from "lucide-react"

export default function ConnectionPage() {
  const router = useRouter()
  const params = useParams<{ connectionId: string }>()
  const [mounted, setMounted] = useState(false)
  const { selectedConversationId, setSelectedConversationId } =
    useConversationStore()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-mount detection for hydration safety
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !getToken()) router.replace("/login")
  }, [router, mounted])

  useEffect(() => {
    return () => {
      useConversationStore.getState().setSelectedConversationId(null)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  const token = getToken()
  if (!token) return null

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar title={params.connectionId.slice(0, 12) + "..."} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Construction
                size={28}
                className="mx-auto mb-3 text-muted-foreground/40"
              />
              <p className="text-sm font-medium text-muted-foreground">
                Dashboard coming soon
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Tables, schemas, and insights will appear here.
              </p>
            </div>
          </div>
        </div>
        <div className="w-120 shrink-0 border-l border-border">
          {selectedConversationId ? (
            <ChatPanel
              conversationId={selectedConversationId}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <ConversationSidebar connectionId={params.connectionId} />
          )}
        </div>
      </div>
    </div>
  )
}
