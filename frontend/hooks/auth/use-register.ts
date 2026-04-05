import { useMutation } from "@tanstack/react-query"
import { register as registerApi } from "@/services/auth/register"
import { setToken, setUser } from "@/lib/auth"
import type { RegisterRequest, RegisterResponse } from "@/interfaces/auth"

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
    },
  })
}
