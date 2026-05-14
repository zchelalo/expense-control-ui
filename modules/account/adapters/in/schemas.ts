import { z } from 'zod'

type Translator = (key: string) => string

export function createAccountSchema(t: Translator) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('form.validation.name_required') }),
    balance: z
      .string()
      .trim()
      .min(1, { message: t('form.validation.balance_required') })
      .refine((value) => Number.isFinite(Number(value)), {
        message: t('form.validation.balance_invalid'),
      })
      .transform((value) => Number(value)),
  })
}
