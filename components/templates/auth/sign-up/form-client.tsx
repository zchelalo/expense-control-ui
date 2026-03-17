'use client'

import { useActionState, useId } from 'react'
import { Button } from '@/components/atoms/button'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { Title } from '@/components/atoms/title'
import { List } from '@/components/molecules/list'
import styles from '@/components/templates/auth/sign-up/sign-up.module.css'
import {
  type SignUpFormState,
  signUpAction,
} from '@/modules/auth/adapters/in/sign-up-action'

type FormClientProps = {
  translations: Record<string, string>
}

const initialState: SignUpFormState = {
  errors: null,
  values: { email: '' },
}

export function FormClient({ translations }: FormClientProps) {
  const [state, formAction, pending] = useActionState<
    SignUpFormState,
    FormData
  >(signUpAction, initialState)

  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()

  return (
    <div className={styles.main}>
      <form className={styles.form} action={formAction}>
        <Title variant='h1' typographySize='extraLarge'>
          {translations.signUpTitle}
        </Title>
        <div className={styles.formGroup}>
          <Label htmlFor={emailId}>{translations.signUpEmailLabel}</Label>
          <InputText
            id={emailId}
            name='email'
            placeholder={translations.signUpEmailPlaceholder}
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
          <Label htmlFor={passwordId}>{translations.signUpPasswordLabel}</Label>
          <InputText
            id={passwordId}
            name='password'
            type='password'
            placeholder={translations.signUpPasswordPlaceholder}
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
          <Label htmlFor={confirmPasswordId}>
            {translations.signUpConfirmPasswordLabel}
          </Label>
          <InputText
            id={confirmPasswordId}
            name='confirmPassword'
            type='password'
            placeholder={translations.signUpConfirmPasswordPlaceholder}
            autoComplete='current-password'
            isPasswordField
            error={!!state.errors?.confirmPassword}
          />
          {state.errors?.confirmPassword &&
            state.errors.confirmPassword.length > 0 && (
              <List
                listStyle='disc'
                messages={state.errors?.confirmPassword}
                className={styles.listError}
                isErrorList
              />
            )}
        </div>
        <div className={styles.formGroup}>
          <Button type='submit' disabled={pending}>
            {translations.signUpSubmitButton}
          </Button>
        </div>
      </form>
    </div>
  )
}
