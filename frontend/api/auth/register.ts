import api from "@/api/client"
import type { RegisterRequest, RegisterResponse } from "@/interfaces/auth"

export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/user/register", data)
  return response.data
}
