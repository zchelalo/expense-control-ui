import { z } from 'zod'

type Translator = (key: string) => string

export function createCategorySchema(t: Translator) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('form.validation.name_required') }),
  })
}
