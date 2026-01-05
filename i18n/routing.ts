import { defineRouting } from 'next-intl/routing'
import { Language } from '@/constants'

export const routing = defineRouting({
  locales: Object.values(Language),
  defaultLocale: Language.En,
})
