import type { InputHTMLAttributes } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import { FormFieldErrors } from '@/components/templates/dashboard/movements/form-field-errors'
import styles from '@/components/templates/dashboard/movements/movements.module.css'

type MovementTextFieldProps = {
  id: string
  label: string
  name: string
  placeholder: string
  errorMessages?: string[] | null
  disabled?: boolean
  defaultValue?: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  min?: string
  step?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
}

export function MovementTextField({
  id,
  label,
  name,
  placeholder,
  errorMessages,
  disabled = false,
  defaultValue,
  type,
  min,
  step,
  inputMode,
}: MovementTextFieldProps) {
  const hasErrors = !!errorMessages && errorMessages.length > 0

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='stretch'
      gap={2}
      className={styles.formGroup}
    >
      <Label htmlFor={id}>{label}</Label>
      <InputText
        id={id}
        name={name}
        type={type}
        min={min}
        step={step}
        inputMode={inputMode}
        placeholder={placeholder}
        error={hasErrors}
        disabled={disabled}
        defaultValue={defaultValue}
      />
      <FormFieldErrors messages={errorMessages} />
    </FlexBox>
  )
}
