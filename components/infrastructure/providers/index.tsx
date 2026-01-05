'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'

type ProvidersProps = {
  readonly children: React.ReactNode
  readonly locale: string
}

export function Providers({ children, locale }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
