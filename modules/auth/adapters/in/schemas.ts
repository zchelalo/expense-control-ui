import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .refine((value) => /[a-z]/.test(value), { params: { rule: 'lowercase' } })
    .refine((value) => /[A-Z]/.test(value), { params: { rule: 'uppercase' } })
    .refine((value) => /\d/.test(value), { params: { rule: 'digit' } })
    .refine((value) => /[^A-Za-z0-9]/.test(value), {
      params: { rule: 'special' },
    }),
})

export const signUpSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .min(8)
      .max(128)
      .refine((value) => /[a-z]/.test(value), { params: { rule: 'lowercase' } })
      .refine((value) => /[A-Z]/.test(value), { params: { rule: 'uppercase' } })
      .refine((value) => /\d/.test(value), { params: { rule: 'digit' } })
      .refine((value) => /[^A-Za-z0-9]/.test(value), {
        params: { rule: 'special' },
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    params: { rule: 'match' },
  })
