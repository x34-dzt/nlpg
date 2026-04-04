import { ChatPanel } from "@/components/chat/panel"

export default async function ChatPanelPage({
  params,
}: {
  params: Promise<{ connectionId: string; conversationId: string }>
}) {
  const { conversationId } = await params

  return (
    <div className="mx-auto h-full max-w-2xl">
      <ChatPanel conversationId={conversationId} />
    </div>
  )
}
