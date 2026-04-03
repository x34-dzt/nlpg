const TOKEN_KEY = "nlp_pg_token"
const USER_KEY = "nlp_pg_user"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
}

export function getUser(): { id: string; username: string } | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setUser(user: { id: string; username: string }): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
