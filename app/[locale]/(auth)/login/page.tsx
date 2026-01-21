import { Login } from '@/components/templates/auth/login'
import { Namespace } from '@/constants/common'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Common,
})

export default async function LoginPage() {
  return <Login />
}
