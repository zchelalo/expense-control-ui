import { getTranslations } from 'next-intl/server'
import { FormClient } from '@/components/templates/auth/sign-up/form-client'
import { Namespace } from '@/constants/common'

export async function SignUp() {
  const t = await getTranslations(Namespace.Common)

  return (
    <FormClient
      translations={{
        signUpTitle: t('auth.sign_up.title'),
        signUpEmailLabel: t('auth.sign_up.email_label'),
        signUpEmailPlaceholder: t('auth.sign_up.email_placeholder'),
        signUpPasswordLabel: t('auth.sign_up.password_label'),
        signUpPasswordPlaceholder: t('auth.sign_up.password_placeholder'),
        signUpConfirmPasswordLabel: t('auth.sign_up.confirm_password_label'),
        signUpConfirmPasswordPlaceholder: t(
          'auth.sign_up.confirm_password_placeholder',
        ),
        signUpSubmitButton: t('auth.sign_up.submit_button'),
        signUpHaveAccountPrompt: t('auth.sign_up.have_account_prompt'),
      }}
    />
  )
}
