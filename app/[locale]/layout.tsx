import { Nunito } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Providers } from '@/components/infrastructure/providers'
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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={nunito.variable}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
