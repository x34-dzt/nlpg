import { create } from "zustand"

interface ConversationStore {
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void
}

export const useConversationStore = create<ConversationStore>((set) => ({
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
}))
