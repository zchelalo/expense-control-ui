'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import { ToastProvider } from '@/components/infrastructure/providers/toast-provider'

type ProvidersProps = {
  readonly children: React.ReactNode
  readonly locale: string
  readonly messages: Record<string, string>
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <ToastProvider />
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
