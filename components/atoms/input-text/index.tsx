import clsx from 'clsx'
import { InputPasswordToggle } from '@/components/atoms/input-text/input-password-toggle'
import styles from '@/components/atoms/input-text/input-text.module.css'

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  isPasswordField?: boolean
  disabled?: boolean
}

export function InputText({
  error,
  isPasswordField = false,
  disabled = false,
  className,
  id,
  ...props
}: InputTextProps) {
  const inputId = id ?? props.name ?? undefined

  const inputClasses = clsx(
    styles.input,
    isPasswordField && styles['input--password'],
    error && styles['input--error'],
    className,
  )

  const containerClasses = clsx(
    styles.container,
    disabled && styles['container--disabled'],
  )

  return (
    <div className={containerClasses}>
      <input
        id={inputId}
        type={isPasswordField ? 'password' : 'text'}
        className={inputClasses}
        disabled={disabled}
        {...props}
      />

      {isPasswordField && inputId && <InputPasswordToggle inputId={inputId} />}
    </div>
  )
}
