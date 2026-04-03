export interface AuthUser {
  id: string
  username: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}
