"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"

export function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  id = "password",
  minLength = 6,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  id?: string
  minLength?: number
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={minLength}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
