"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { Navbar } from "@/components/layout/navbar"
import { ConversationSidebar } from "@/components/conversations/conversation-sidebar"
import { ChatPanel } from "@/components/chat/panel"
import { useConversationStore } from "@/stores/conversation"
import { Construction, Loader2 } from "lucide-react"

export default function ConnectionPage() {
  const params = useParams<{ connectionId: string }>()
  const isReady = useRequireAuth()
  const { selectedConversationId, setSelectedConversationId } =
    useConversationStore()

  useEffect(() => {
    return () => {
      useConversationStore.getState().setSelectedConversationId(null)
    }
  }, [])

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

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
