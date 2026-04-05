import { SidebarProvider } from "@/components/layout/sidebar-provider"
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
    <SidebarProvider
      sidebar={<ConversationSidebar connectionId={connectionId} />}
    >
      {children}
    </SidebarProvider>
  )
}
