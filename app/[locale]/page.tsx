import { Landing } from '@/components/templates/landing'
import { Namespace } from '@/constants/common'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Landing,
})

export default async function Home() {
  return <Landing />
}
