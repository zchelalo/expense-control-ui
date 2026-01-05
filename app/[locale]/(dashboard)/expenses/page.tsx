import { Namespace } from '@/constants'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Common,
})

export default async function Expenses() {
  return <div>expenses</div>
}
