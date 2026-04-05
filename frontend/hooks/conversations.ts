import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  listConversations,
  createConversation,
  deleteConversation,
} from "@/services/conversations"

export function useConversations(connectionId: string) {
  return useInfiniteQuery({
    queryKey: ["conversations", connectionId],
    queryFn: ({ pageParam }) => listConversations(connectionId, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (connectionId: string) => createConversation(connectionId),
    onSuccess: (_data, connectionId) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", connectionId],
      })
    },
  })
}

export function useDeleteConversation(connectionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) =>
      deleteConversation(connectionId, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", connectionId],
      })
    },
  })
}
