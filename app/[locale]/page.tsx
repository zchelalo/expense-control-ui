import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants'
import { generateI18nMetadata } from '@/i18n/metadata'

export async function generateMetadata(): Promise<Metadata> {
  return generateI18nMetadata({
    namespace: Namespace.Common,
  })
}

export default async function Home() {
  const t = await getTranslations(Namespace.Common)

  return (
    <div>
      <main>{t('home')}</main>
    </div>
  )
}
