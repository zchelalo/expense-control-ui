import clsx from 'clsx'
import { FlexBox } from '@/components/atoms/flex-box'
import { Label } from '@/components/atoms/label'
import { Select } from '@/components/molecules/select'
import { FormFieldErrors } from '@/components/templates/dashboard/movements/form-field-errors'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import type {
  SearchableSelectProps,
  SelectOption,
} from '@/components/templates/dashboard/movements/types'

type MovementSelectFieldProps = {
  id: string
  label?: string
  name?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder: string
  errorMessages?: string[] | null
  disabled?: boolean
  searchable?: SearchableSelectProps
  className?: string
}

export function MovementSelectField({
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
  className,
}: MovementSelectFieldProps) {
  const hasErrors = !!errorMessages && errorMessages.length > 0

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='stretch'
      gap={2}
      className={clsx(className)}
    >
      {label && <Label htmlFor={id}>{label}</Label>}
      {name && <input type='hidden' name={name} value={value} />}
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
        triggerClassName={hasErrors ? styles.selectError : undefined}
        disabled={disabled}
      />
      <FormFieldErrors messages={errorMessages} />
    </FlexBox>
  )
}
