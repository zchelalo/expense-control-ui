'use client'

import { useActionState, useEffect, useId } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import { List } from '@/components/molecules/list'
import styles from '@/components/templates/auth/sign-up/sign-up.module.css'
import { Link } from '@/i18n/navigation'
import {
  type SignUpFormState,
  signUpAction,
} from '@/modules/auth/adapters/in/sign-up-action'
import { toast } from '@/utils/toast'

type FormClientProps = {
  translations: Record<string, string>
}

const initialState: SignUpFormState = {
  errors: null,
  globalError: null,
  values: { email: '' },
}

export function FormClient({ translations }: FormClientProps) {
  const [state, formAction, pending] = useActionState<
    SignUpFormState,
    FormData
  >(signUpAction, initialState)

  useEffect(() => {
    if (state.globalError) {
      toast.error(state.globalError.message)
    }
  }, [state.globalError])

  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()

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
          {translations.signUpTitle}
        </Title>
        <FlexBox
          variant='div'
          direction='column'
          alignItems='stretch'
          gap={2}
          className={styles.formGroup}
        >
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
        </FlexBox>
        <FlexBox
          variant='div'
          direction='column'
          alignItems='stretch'
          gap={2}
          className={styles.formGroup}
        >
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
        </FlexBox>
        <FlexBox
          variant='div'
          direction='column'
          alignItems='stretch'
          gap={2}
          className={styles.formGroup}
        >
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
        </FlexBox>
        <FlexBox
          variant='div'
          direction='column'
          alignItems='stretch'
          gap={2}
          className={styles.formGroup}
        >
          <Button type='submit' disabled={pending}>
            {translations.signUpSubmitButton}
          </Button>
        </FlexBox>
        <Link href='/login' className={styles.link}>
          <Text variant='span' typographySize='small'>
            {translations.signUpHaveAccountPrompt}
          </Text>
        </Link>
      </form>
    </FlexBox>
  )
}
