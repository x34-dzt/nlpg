import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  listConnections,
  createConnection,
  deleteConnection,
  healthCheck,
} from "@/api/connections/"
import type { CreateConnectionRequest } from "@/interfaces/connections"

export function useConnections() {
  return useInfiniteQuery({
    queryKey: ["connections"],
    queryFn: ({ pageParam }) => listConnections(pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  })
}

export function useCreateConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateConnectionRequest) => createConnection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] })
    },
  })
}

export function useDeleteConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (connectionId: string) => deleteConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] })
    },
  })
}

export function useConnectionHealth() {
  return useMutation({
    mutationFn: (connectionId: string) => healthCheck(connectionId),
  })
}
