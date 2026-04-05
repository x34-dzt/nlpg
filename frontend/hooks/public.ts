import { useQuery } from "@tanstack/react-query"
import { getPublicDashboard } from "@/services/public"

export function usePublicDashboard(token: string) {
  return useQuery({
    queryKey: ["public-dashboard", token],
    queryFn: () => getPublicDashboard(token),
  })
}
