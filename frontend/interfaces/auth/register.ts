export interface RegisterRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  user: { id: string; username: string }
  token: string
}
