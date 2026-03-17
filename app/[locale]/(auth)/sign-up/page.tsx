import { SignUp } from '@/components/templates/auth/sign-up'
import { Namespace } from '@/constants/common'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Common,
})

export default async function SignUpPage() {
  return <SignUp />
}
