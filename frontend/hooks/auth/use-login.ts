import { useMutation } from "@tanstack/react-query"
import { login as loginApi } from "@/services/auth/login"
import { setToken, setUser } from "@/lib/auth"
import type { LoginRequest, LoginResponse } from "@/interfaces/auth"

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
    },
  })
}
