import type { AuthResponse } from "./types"

export interface LoginRequest {
  username: string
  password: string
}

export type LoginResponse = AuthResponse
