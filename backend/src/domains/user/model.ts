import type { Static } from "elysia";
import { t } from "elysia";

export const registerSchema = t.Object({
  username: t.String({ minLength: 3, maxLength: 30 }),
  password: t.String({ minLength: 6, maxLength: 100 }),
});

export const loginSchema = t.Object({
  username: t.String({ minLength: 3, maxLength: 30 }),
  password: t.String({ minLength: 6, maxLength: 100 }),
});

export const authResponseSchema = t.Object({
  user: t.Object({
    id: t.String(),
    username: t.String(),
  }),
  token: t.String(),
});

export type RegisterSchema = Static<typeof registerSchema>;
export type LoginSchema = Static<typeof loginSchema>;
export type AuthResponse = Static<typeof authResponseSchema>;
