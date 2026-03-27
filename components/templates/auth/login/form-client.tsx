'use client'

import { useActionState, useEffect, useId } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import { List } from '@/components/molecules/list'
import styles from '@/components/templates/auth/login/login.module.css'
import { Link } from '@/i18n/navigation'
import {
  type LoginFormState,
  loginAction,
} from '@/modules/auth/adapters/in/login-action'
import { toast } from '@/utils/toast'

type FormClientProps = {
  translations: Record<string, string>
}

const initialState: LoginFormState = {
  errors: null,
  globalError: null,
  values: { email: '' },
}

export function FormClient({ translations }: FormClientProps) {
  const [state, formAction, pending] = useActionState<LoginFormState, FormData>(
    loginAction,
    initialState,
  )

  useEffect(() => {
    if (state.globalError) {
      toast.error(state.globalError.message)
    }
  }, [state.globalError])

  const emailId = useId()
  const passwordId = useId()

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='center'
      justifyContent='center'
      className={styles.main}
    >
      <form className={styles.form} action={formAction}>
        <Title variant='h1' typographySize='extraLarge'>
          {translations.loginTitle}
        </Title>
        <FlexBox
          variant='div'
          direction='column'
          alignItems='stretch'
          gap={2}
          className={styles.formGroup}
        >
          <Label htmlFor={emailId}>{translations.loginEmailLabel}</Label>
          <InputText
            id={emailId}
            name='email'
            placeholder={translations.loginEmailPlaceholder}
            autoComplete='email'
            error={!!state.errors?.email}
            defaultValue={state.values.email}
          />
          {state.errors?.email && state.errors.email.length > 0 && (
            <List
              listStyle='disc'
              messages={state.errors?.email}
              className={styles.listError}
              isErrorList
            />
          )}
        </FlexBox>
        <FlexBox
          variant='div'
          direction='column'
          alignItems='stretch'
          gap={2}
          className={styles.formGroup}
        >
          <Label htmlFor={passwordId}>{translations.loginPasswordLabel}</Label>
          <InputText
            id={passwordId}
            name='password'
            type='password'
            placeholder={translations.loginPasswordPlaceholder}
            autoComplete='current-password'
            isPasswordField
            error={!!state.errors?.password}
          />
          {state.errors?.password && state.errors.password.length > 0 && (
            <List
              listStyle='disc'
              messages={state.errors?.password}
              className={styles.listError}
              isErrorList
            />
          )}
        </FlexBox>
        <FlexBox
          variant='div'
          direction='column'
          alignItems='stretch'
          gap={2}
          className={styles.formGroup}
        >
          <Button type='submit' disabled={pending}>
            {translations.loginSubmitButton}
          </Button>
        </FlexBox>
        <Link href='/sign-up' className={styles.link}>
          <Text variant='span' typographySize='small'>
            {translations.loginNoAccountPrompt}
          </Text>
        </Link>
      </form>
    </FlexBox>
  )
}
