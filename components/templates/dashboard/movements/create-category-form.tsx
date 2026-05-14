import { Button } from '@/components/atoms/button'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { MovementTextField } from '@/components/templates/dashboard/movements/text-field'
import type { CreateCategoryFormState } from '@/modules/category/adapters/in/create-action'

type CreateCategoryTranslations = {
  nameLabel: string
  namePlaceholder: string
  createCategory: string
  creatingCategory: string
}

type CreateCategoryFormProps = {
  formVersion: number
  formAction: (payload: FormData) => void
  pending: boolean
  state: CreateCategoryFormState
  translations: CreateCategoryTranslations
  nameId: string
}

export function CreateCategoryForm({
  formVersion,
  formAction,
  pending,
  state,
  translations,
  nameId,
}: CreateCategoryFormProps) {
  return (
    <form key={formVersion} className={styles.form} action={formAction}>
      <MovementTextField
        id={nameId}
        label={translations.nameLabel}
        name='name'
        placeholder={translations.namePlaceholder}
        errorMessages={state.errors?.name}
        disabled={pending}
        defaultValue={state.values.name}
      />
      <Button type='submit' className={styles.submitButton} disabled={pending}>
        {pending ? translations.creatingCategory : translations.createCategory}
      </Button>
    </form>
  )
}
