import clsx from 'clsx'
import { FlexBox } from '@/components/atoms/flex-box'
import { InputDate } from '@/components/atoms/input-date'
import { Label } from '@/components/atoms/label'
import { FormFieldErrors } from '@/components/templates/dashboard/movements/form-field-errors'
import styles from '@/components/templates/dashboard/movements/movements.module.css'

type MovementDateFieldProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  errorMessages?: string[] | null
  disabled?: boolean
  min?: string
  max?: string
  className?: string
}

export function MovementDateField({
  id,
  label,
  value,
  onChange,
  errorMessages,
  disabled = false,
  min,
  max,
  className,
}: MovementDateFieldProps) {
  const hasErrors = !!errorMessages && errorMessages.length > 0

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='stretch'
      gap={2}
      className={clsx(styles.formGroup, className)}
    >
      {label && <Label htmlFor={id}>{label}</Label>}
      <InputDate
        id={id}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        error={hasErrors}
        disabled={disabled}
      />
      <FormFieldErrors messages={errorMessages} />
    </FlexBox>
  )
}
