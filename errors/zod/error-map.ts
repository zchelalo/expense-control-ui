import type { getTranslations } from 'next-intl/server'
import type { z } from 'zod'

type T = Awaited<ReturnType<typeof getTranslations>>

export const makeErrorMap = (t: T): z.core.$ZodErrorMap => {
  return (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        return {
          message: t('errors.zod.invalid.type', {
            expectedType: issue.expected,
          }),
        }
      case 'invalid_element':
        return {
          message: t('errors.zod.invalid.element', {
            expectedElement: issue.expected as string,
          }),
        }
      case 'invalid_format':
        return {
          message: t('errors.zod.invalid.format', {
            expectedFormat: issue.format,
          }),
        }
      case 'invalid_key':
        return {
          message: t('errors.zod.invalid.key', {
            expectedKey: issue.expected as string,
          }),
        }
      case 'invalid_union':
        return {
          message: t('errors.zod.invalid.union'),
        }
      case 'invalid_value':
        return {
          message: t('errors.zod.invalid.value', {
            expectedValue: issue.expected as string,
          }),
        }
      case 'not_multiple_of':
        return {
          message: t('errors.zod.not_multiple_of', {
            multipleOf: issue.multipleOf as number,
          }),
        }
      case 'too_big':
        return {
          message: t('errors.zod.too.big', {
            maximum: issue.maximum as number,
          }),
        }
      case 'too_small':
        return {
          message: t('errors.zod.too.small', {
            minimum: issue.minimum as number,
          }),
        }
      case 'unrecognized_keys':
        return {
          message: t('errors.zod.unrecognized_keys', {
            keys: issue.keys.join(', '),
          }),
        }
      case 'custom': {
        const rule = issue.params?.rule
        switch (rule) {
          case 'lowercase':
            return {
              message: t('errors.zod.password.lowercase'),
            }
          case 'uppercase':
            return {
              message: t('errors.zod.password.uppercase'),
            }
          case 'digit':
            return {
              message: t('errors.zod.password.digit'),
            }
          case 'special':
            return {
              message: t('errors.zod.password.special'),
            }
          default:
            return {
              message: issue.message || t('errors.zod.default'),
            }
        }
      }
      default:
        return {
          message: t('errors.zod.default'),
        }
    }
  }
}
