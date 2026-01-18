import { Namespace } from '@/constants/common'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Common,
})

export default async function Incomes() {
  return <div>income</div>
}
