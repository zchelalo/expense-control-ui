import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { List } from '@/components/molecules/list'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import type { CreateAccountTranslations } from '@/components/templates/dashboard/accounts/types'
import type { CreateAccountFormState } from '@/modules/account/adapters/in/create-action'

type CreateAccountFormProps = {
  formVersion: number
  formAction: (payload: FormData) => void
  pending: boolean
  state: CreateAccountFormState
  translations: CreateAccountTranslations
  nameId: string
  balanceId: string
}

type AccountFormFieldErrorsProps = {
  messages?: string[] | null
}

function AccountFormFieldErrors({ messages }: AccountFormFieldErrorsProps) {
  if (!messages || messages.length === 0) return null

  return (
    <List
      listStyle='disc'
      messages={messages}
      className={styles.listError}
      isErrorList
    />
  )
}

export function CreateAccountForm({
  formVersion,
  formAction,
  pending,
  state,
  translations,
  nameId,
  balanceId,
}: CreateAccountFormProps) {
  const hasNameErrors = !!state.errors?.name?.length
  const hasBalanceErrors = !!state.errors?.balance?.length

  return (
    <form key={formVersion} className={styles.modalForm} action={formAction}>
      <FlexBox
        variant='div'
        direction='column'
        alignItems='stretch'
        gap={2}
        className={styles.modalFormGroup}
      >
        <Label htmlFor={nameId}>{translations.nameLabel}</Label>
        <InputText
          id={nameId}
          name='name'
          placeholder={translations.namePlaceholder}
          error={hasNameErrors}
          disabled={pending}
          defaultValue={state.values.name}
        />
        <AccountFormFieldErrors messages={state.errors?.name} />
      </FlexBox>
      <FlexBox
        variant='div'
        direction='column'
        alignItems='stretch'
        gap={2}
        className={styles.modalFormGroup}
      >
        <Label htmlFor={balanceId}>{translations.balanceLabel}</Label>
        <InputText
          id={balanceId}
          name='balance'
          type='number'
          step='0.01'
          inputMode='decimal'
          placeholder={translations.balancePlaceholder}
          error={hasBalanceErrors}
          disabled={pending}
          defaultValue={state.values.balance}
        />
        <AccountFormFieldErrors messages={state.errors?.balance} />
      </FlexBox>
      <Button type='submit' className={styles.submitButton} disabled={pending}>
        {pending ? translations.creatingAccount : translations.createAccount}
      </Button>
    </form>
  )
}
