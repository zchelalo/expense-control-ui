import { getTranslations } from 'next-intl/server'
import { FormClient } from '@/components/templates/auth/login/form-client'
import { Namespace } from '@/constants/common'

export async function Login() {
  const t = await getTranslations(Namespace.Common)

  return (
    <FormClient
      translations={{
        loginTitle: t('auth.login.title'),
        loginEmailLabel: t('auth.login.email_label'),
        loginEmailPlaceholder: t('auth.login.email_placeholder'),
        loginPasswordLabel: t('auth.login.password_label'),
        loginPasswordPlaceholder: t('auth.login.password_placeholder'),
        loginSubmitButton: t('auth.login.submit_button'),
        loginNoAccountPrompt: t('auth.login.no_account_prompt'),
      }}
    />
  )
}
