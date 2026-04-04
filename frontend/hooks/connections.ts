import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  listConnections,
  createConnection,
  deleteConnection,
  healthCheck,
  getConnectionSchema,
  shareDashboard,
  unshareDashboard,
  getConnection,
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

export function useSchema(connectionId: string) {
  return useQuery({
    queryKey: ["schema", connectionId],
    queryFn: () => getConnectionSchema(connectionId),
    staleTime: 1000 * 60 * 10,
  })
}

export function useConnection(connectionId: string) {
  return useQuery({
    queryKey: ["connection", connectionId],
    queryFn: () => getConnection(connectionId),
  })
}

export function useShareDashboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (connectionId: string) => shareDashboard(connectionId),
    onSuccess: (_, connectionId) => {
      queryClient.invalidateQueries({
        queryKey: ["connection", connectionId],
      })
    },
  })
}

export function useUnshareDashboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (connectionId: string) => unshareDashboard(connectionId),
    onSuccess: (_, connectionId) => {
      queryClient.invalidateQueries({
        queryKey: ["connection", connectionId],
      })
    },
  })
}
