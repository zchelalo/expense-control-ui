import { Accounts } from '@/components/templates/dashboard/accounts'
import { Namespace } from '@/constants/common'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Common,
})

export default async function AccountsPage() {
  return <Accounts />
}
