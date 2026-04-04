const API_KEY_KEY = "nlp_pg_api_key"

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(API_KEY_KEY)
}

export function setApiKey(key: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(API_KEY_KEY, key)
}

export function removeApiKey(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(API_KEY_KEY)
}
