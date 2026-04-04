import { AxiosError } from "axios"

export function extractErrorMessage(error: unknown): string {
  if (!(error instanceof AxiosError)) {
    return error instanceof Error ? error.message : "Something went wrong"
  }
  const msg = error.response?.data?.message
  return Array.isArray(msg) ? msg.join(", ") : msg || "Something went wrong"
}
