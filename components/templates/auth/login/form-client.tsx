'use client'

import { useActionState } from 'react'
import { Button } from '@/components/atoms/button'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { Title } from '@/components/atoms/title'
import { List } from '@/components/molecules/list'
import styles from '@/components/templates/auth/login/login.module.css'
import {
  type LoginFormState,
  loginAction,
} from '@/modules/auth/adapters/in/login-action'

type FormClientProps = {
  translations: Record<string, string>
}

const initialState: LoginFormState = {
  errors: null,
  values: { email: '' },
}

export function FormClient({ translations }: FormClientProps) {
  const [state, formAction, pending] = useActionState<LoginFormState, FormData>(
    loginAction,
    initialState,
  )

  return (
    <div className={styles.main}>
      <form className={styles.form} action={formAction}>
        <Title variant='h1' typographySize='extraLarge'>
          {translations.loginTitle}
        </Title>
        <div className={styles.formGroup}>
          <Label htmlFor='login-email'>{translations.loginEmailLabel}</Label>
          <InputText
            id='login-email'
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
        </div>
        <div className={styles.formGroup}>
          <Label htmlFor='login-password'>
            {translations.loginPasswordLabel}
          </Label>
          <InputText
            id='login-password'
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
        </div>
        <div className={styles.formGroup}>
          <Button type='submit' disabled={pending}>
            {translations.loginSubmitButton}
          </Button>
        </div>
      </form>
    </div>
  )
}
