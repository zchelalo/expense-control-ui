import { AccountError } from '@/modules/account/ports/errors'

type Translator = (key: string) => string

export function mapAccountErrorToMessage(error: unknown, t: Translator): string {
  if (error instanceof AccountError) {
    return t(`accounts.errors.${error.code}`)
  }

  if (error instanceof Error) {
    return error.message
  }

  return t('errors.unknown_error')
}
