import { Language } from '@/constants/common'

export function getCurrencyFromLanguage(locale: Language): string {
  const language = locale.split('-')[0] as Language
  const map: Record<Language, string> = {
    [Language.Es]: 'MXN',
    [Language.En]: 'USD',
  }

  return map[language] ?? 'USD'
}
