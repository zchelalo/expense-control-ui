import { z } from 'zod'

type Translator = (key: string) => string

export function createMovementSchema(t: Translator) {
  return z.object({
    accountId: z
      .string()
      .trim()
      .min(1, { message: t('form.validation.account_required') }),
    amount: z
      .string()
      .trim()
      .min(1, { message: t('form.validation.amount_required') })
      .refine((value) => !Number.isNaN(Number(value)), {
        message: t('form.validation.amount_invalid'),
      })
      .transform((value) => Number(value))
      .refine((value) => value >= 0, {
        message: t('form.validation.amount_non_negative'),
      }),
    description: z
      .string()
      .trim()
      .min(1, { message: t('form.validation.description_required') }),
    movementTypeId: z
      .string()
      .trim()
      .min(1, { message: t('form.validation.movement_type_required') }),
    categoryId: z
      .string()
      .trim()
      .min(1, { message: t('form.validation.category_required') }),
  })
}
