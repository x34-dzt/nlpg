import type { AuthResponse } from "./types"

export interface RegisterRequest {
  username: string
  password: string
}

export type RegisterResponse = AuthResponse
