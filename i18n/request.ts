import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { Namespace } from '@/constants/common'
import { routing } from '@/i18n/routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const entries = await Promise.all(
    (Object.values(Namespace) as string[]).map(async (ns) => {
      try {
        const mod = await import(`@/i18n/messages/${locale}/${ns}.json`)
        return [ns, mod.default] as const
      } catch {
        return [ns, {}] as const
      }
    }),
  )

  const messages = Object.fromEntries(entries)

  return {
    locale,
    messages,
  }
})
