import { AuthError } from '@/modules/auth/ports/errors'

type Translator = (key: string) => string

export function mapAuthErrorToMessage(error: unknown, t: Translator): string {
  if (error instanceof AuthError) {
    return t(`errors.${error.code}`)
  }

  if (error instanceof Error) {
    return t('errors.unknown_error')
  }

  return t('errors.unknown_error')
}
