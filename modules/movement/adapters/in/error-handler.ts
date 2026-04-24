import { MovementError } from '@/modules/movement/ports/errors'

type Translator = (key: string) => string

export function mapMovementErrorToMessage(
  error: unknown,
  t: Translator,
): string {
  if (error instanceof MovementError) {
    return t(`errors.${error.code}`)
  }

  if (error instanceof Error) {
    return t('errors.unknown_error')
  }

  return t('errors.unknown_error')
}
