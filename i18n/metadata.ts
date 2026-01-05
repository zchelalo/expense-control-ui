import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants'

type FactoryOptions = {
  namespace?: string
}

type GenerateMetadataOptions = {
  params: { locale: string }
}

export function createGenerateMetadata({ namespace }: FactoryOptions) {
  return async function generateMetadata(
    _: GenerateMetadataOptions,
  ): Promise<Metadata> {
    const t = await getTranslations(namespace ?? Namespace.Common)

    return {
      title: t('metadata.title'),
      description: t('metadata.description'),
    }
  }
}
