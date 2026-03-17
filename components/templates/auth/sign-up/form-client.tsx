'use client'

import { useActionState } from 'react'
import { Button } from '@/components/atoms/button'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
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

  return (
    <div className={styles.main}>
      <form className={styles.form} action={formAction}>
        <Title variant='h1' typographySize='extraLarge'>
          {translations.signUpTitle}
        </Title>
        <div className={styles.formGroup}>
          <Label htmlFor='sign-up-email'>{translations.signUpEmailLabel}</Label>
          <InputText
            id='sign-up-email'
            name='email'
            placeholder={translations.signUpEmailPlaceholder}
            autoComplete='email'
            error={!!state.errors?.email}
            defaultValue={state.values.email}
          />
          {state.errors?.email && state.errors.email.length > 0 && (
            <ul className={styles.fieldListError}>
              {state.errors?.email?.map((err) => (
                <li key={err} className={styles.fieldError}>
                  <Text role='alert' variant='span' typographySize='small'>
                    {err}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.formGroup}>
          <Label htmlFor='sign-up-password'>
            {translations.signUpPasswordLabel}
          </Label>
          <InputText
            id='sign-up-password'
            name='password'
            type='password'
            placeholder={translations.signUpPasswordPlaceholder}
            autoComplete='current-password'
            isPasswordField
            error={!!state.errors?.password}
          />
          {state.errors?.password && state.errors.password.length > 0 && (
            <ul className={styles.fieldListError}>
              {state.errors?.password?.map((err) => (
                <li key={err} className={styles.fieldError}>
                  <Text role='alert' variant='span' typographySize='small'>
                    {err}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.formGroup}>
          <Label htmlFor='sign-up-confirm-password'>
            {translations.signUpConfirmPasswordLabel}
          </Label>
          <InputText
            id='sign-up-confirm-password'
            name='confirmPassword'
            type='password'
            placeholder={translations.signUpConfirmPasswordPlaceholder}
            autoComplete='current-password'
            isPasswordField
            error={!!state.errors?.confirmPassword}
          />
          {state.errors?.confirmPassword &&
            state.errors.confirmPassword.length > 0 && (
              <ul className={styles.fieldListError}>
                {state.errors?.confirmPassword?.map((err) => (
                  <li key={err} className={styles.fieldError}>
                    <Text role='alert' variant='span' typographySize='small'>
                      {err}
                    </Text>
                  </li>
                ))}
              </ul>
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
