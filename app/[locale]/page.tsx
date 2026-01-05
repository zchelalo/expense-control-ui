import { getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Common,
})

export default async function Home() {
  const t = await getTranslations(Namespace.Common)

  return (
    <div>
      <main>{t('home')}</main>
    </div>
  )
}
