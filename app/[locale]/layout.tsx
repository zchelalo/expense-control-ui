import { Nunito } from 'next/font/google'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Providers } from '@/components/infrastructure/providers'
import { Auth as AuthEnum } from '@/constants/auth'
import { routing } from '@/i18n/routing'

import '@/app/globals.css'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

type RootLayoutProps = {
  readonly children: React.ReactNode
  readonly params: Promise<{ locale: string }>
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const messages = await getMessages()

  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const cookieStore = await cookies()
  const hasAccessToken = cookieStore.has(AuthEnum.AccessToken)
  const hasRefreshToken = cookieStore.has(AuthEnum.RefreshToken)
  const isAuthenticated = hasAccessToken || hasRefreshToken

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={nunito.variable}>
        <Providers
          locale={locale}
          messages={messages}
          initialIsAuthenticated={isAuthenticated}
        >
          {children}
        </Providers>
      </body>
    </html>
  )
}
