import { ConversationSidebar } from "@/components/conversations/conversation-sidebar"

export default async function ConnectionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ connectionId: string }>
}) {
  const { connectionId } = await params

  return (
    <div className="flex h-screen bg-background">
      <div className="w-72 shrink-0 border-r border-border">
        <ConversationSidebar connectionId={connectionId} />
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
