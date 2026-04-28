import { FlexBox } from '@/components/atoms/flex-box'
import { Label } from '@/components/atoms/label'
import { Select } from '@/components/molecules/select'
import { FormFieldErrors } from '@/components/templates/dashboard/movements/form-field-errors'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import type { SelectOption } from '@/components/templates/dashboard/movements/types'

type SearchableProps = {
  onSearchTextChange: (value: string) => void
  onLoadMore: () => void
  searchPlaceholder: string
  hasMore: boolean
  isLoadingMore: boolean
}

type CreateMovementSelectFieldProps = {
  id: string
  label: string
  name: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder: string
  errorMessages?: string[] | null
  disabled?: boolean
  searchable?: SearchableProps
}

export function CreateMovementSelectField({
  id,
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  errorMessages,
  disabled = false,
  searchable,
}: CreateMovementSelectFieldProps) {
  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='stretch'
      gap={2}
      className={styles.formGroup}
    >
      <Label htmlFor={id}>{label}</Label>
      <input type='hidden' name={name} value={value} />
      <Select
        id={id}
        options={options}
        value={value}
        onChange={onChange}
        onSearchTextChange={searchable?.onSearchTextChange}
        onLoadMore={searchable?.onLoadMore}
        placeholder={placeholder}
        searchInput={!!searchable}
        searchPlaceholder={searchable?.searchPlaceholder}
        hasMore={searchable?.hasMore ?? false}
        isLoadingMore={searchable?.isLoadingMore ?? false}
        triggerClassName={errorMessages ? styles.selectError : undefined}
        disabled={disabled}
      />
      <FormFieldErrors messages={errorMessages} />
    </FlexBox>
  )
}
