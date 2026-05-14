import { CategoryError } from '@/modules/category/ports/errors'

type Translator = (key: string) => string

export function mapCategoryErrorToMessage(
  error: unknown,
  t: Translator,
): string {
  if (error instanceof CategoryError) {
    return t(`errors.${error.code}`)
  }

  if (error instanceof Error) {
    return t('errors.unknown_error')
  }

  return t('errors.unknown_error')
}
