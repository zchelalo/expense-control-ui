import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Providers } from '@/components/providers'
import { MainLayout } from '@/components/templates/main-layout'

import '@/app/globals.css'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Expense Control',
  description: 'Application to control your expenses easily',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${nunito.variable}`}>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  )
}
