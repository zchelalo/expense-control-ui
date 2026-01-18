import { defineRouting } from 'next-intl/routing'
import { Language } from '@/constants/common'

export const routing = defineRouting({
  locales: Object.values(Language),
  defaultLocale: Language.En,
})
