import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  listWidgets,
  createWidget,
  updateWidget,
  deleteWidget,
  updateLayouts,
  executeWidgets,
} from "@/api/widgets/"
import type {
  CreateWidgetRequest,
  UpdateWidgetRequest,
  UpdateLayoutsRequest,
} from "@/interfaces/widgets"

export function useWidgets(connectionId: string) {
  return useQuery({
    queryKey: ["widgets", connectionId],
    queryFn: () => listWidgets(connectionId),
  })
}

export function useCreateWidget(connectionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWidgetRequest) => createWidget(connectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets", connectionId] })
    },
  })
}

export function useUpdateWidget(connectionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      widgetId,
      data,
    }: {
      widgetId: string
      data: UpdateWidgetRequest
    }) => updateWidget(connectionId, widgetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets", connectionId] })
    },
  })
}

export function useDeleteWidget(connectionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (widgetId: string) => deleteWidget(connectionId, widgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets", connectionId] })
    },
  })
}

export function useUpdateLayouts(connectionId: string) {
  return useMutation({
    mutationFn: (data: UpdateLayoutsRequest) =>
      updateLayouts(connectionId, data),
  })
}

export function useWidgetResults(connectionId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["widget-results", connectionId],
    queryFn: () => executeWidgets(connectionId),
    enabled,
  })
}
