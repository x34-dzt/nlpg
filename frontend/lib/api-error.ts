import { AxiosError } from "axios"

export function extractErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ message: string | string[] }>
  const msg = err.response?.data?.message
  return Array.isArray(msg) ? msg.join(", ") : msg || "Something went wrong"
}
