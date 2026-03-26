'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/components/infrastructure/providers/auth-provider'
import { ToastProvider } from '@/components/infrastructure/providers/toast-provider'

type ProvidersProps = {
  readonly children: React.ReactNode
  readonly locale: string
  readonly messages: Record<string, string>
  readonly initialIsAuthenticated: boolean
}

export function Providers({
  children,
  locale,
  messages,
  initialIsAuthenticated,
}: ProvidersProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone='America/Hermosillo'
    >
      <AuthProvider initialIsAuthenticated={initialIsAuthenticated}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <ToastProvider />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
