import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants'

type Options = {
  readonly namespace?: Namespace
}

export async function generateI18nMetadata({
  namespace,
}: Options): Promise<Metadata> {
  const t = await getTranslations(namespace ?? Namespace.Common)

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}
