import type { ReactNode } from 'react'
import { Button } from '@/components/atoms/button'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { MovementSelectField } from '@/components/templates/dashboard/movements/select-field'
import { MovementTextField } from '@/components/templates/dashboard/movements/text-field'
import type {
  CreateMovementTranslations,
  MovementTypeOption,
  SearchableSelectProps,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'
import type { CreateMovementFormState } from '@/modules/movement/adapters/in/create-action'

type CreateMovementFormProps = {
  formVersion: number
  formAction: (payload: FormData) => void
  pending: boolean
  state: CreateMovementFormState
  translations: CreateMovementTranslations
  accountFieldId: string
  amountId: string
  descriptionId: string
  movementTypeId: string
  categoryId: string
  selectedAccountId: string
  selectedMovementTypeId: string
  selectedCategoryId: string
  accountOptions: SelectOption[]
  movementTypes: MovementTypeOption[]
  categoryOptions: SelectOption[]
  onAccountChange: (value: string) => void
  onMovementTypeChange: (value: string) => void
  onCategoryChange: (value: string) => void
  accountSearchable: SearchableSelectProps
  categorySearchable: SearchableSelectProps
  categoryAction?: ReactNode
}

export function CreateMovementForm({
  formVersion,
  formAction,
  pending,
  state,
  translations,
  accountFieldId,
  amountId,
  descriptionId,
  movementTypeId,
  categoryId,
  selectedAccountId,
  selectedMovementTypeId,
  selectedCategoryId,
  accountOptions,
  movementTypes,
  categoryOptions,
  onAccountChange,
  onMovementTypeChange,
  onCategoryChange,
  accountSearchable,
  categorySearchable,
  categoryAction,
}: CreateMovementFormProps) {
  return (
    <form key={formVersion} className={styles.form} action={formAction}>
      <MovementSelectField
        id={accountFieldId}
        label={translations.accountLabel}
        name='accountId'
        value={selectedAccountId}
        options={accountOptions}
        onChange={onAccountChange}
        placeholder={translations.accountPlaceholder}
        errorMessages={state.errors?.accountId}
        disabled={pending}
        searchable={accountSearchable}
        className={styles.formGroup}
      />
      <MovementTextField
        id={amountId}
        label={translations.amountLabel}
        name='amount'
        type='number'
        min='0'
        step='0.01'
        inputMode='decimal'
        placeholder={translations.amountPlaceholder}
        errorMessages={state.errors?.amount}
        disabled={pending}
        defaultValue={state.values.amount}
      />
      <MovementTextField
        id={descriptionId}
        label={translations.descriptionLabel}
        name='description'
        placeholder={translations.descriptionPlaceholder}
        errorMessages={state.errors?.description}
        disabled={pending}
        defaultValue={state.values.description}
      />
      <MovementSelectField
        id={movementTypeId}
        label={translations.movementTypeLabel}
        name='movementTypeId'
        value={selectedMovementTypeId}
        options={movementTypes}
        onChange={onMovementTypeChange}
        placeholder={translations.movementTypePlaceholder}
        errorMessages={state.errors?.movementTypeId}
        disabled={pending}
        className={styles.formGroup}
      />
      <MovementSelectField
        id={categoryId}
        label={translations.categoryLabel}
        name='categoryId'
        value={selectedCategoryId}
        options={categoryOptions}
        onChange={onCategoryChange}
        placeholder={translations.categoryPlaceholder}
        errorMessages={state.errors?.categoryId}
        disabled={pending}
        searchable={categorySearchable}
        className={styles.formGroup}
        action={categoryAction}
      />
      <Button type='submit' className={styles.submitButton} disabled={pending}>
        {pending ? translations.creatingMovement : translations.createMovement}
      </Button>
    </form>
  )
}
