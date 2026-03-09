'use client'

import clsx from 'clsx'
import { Eye, EyeClosed } from 'lucide-react'
import { useState } from 'react'
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
  type,
  ...props
}: InputTextProps) {
  const [showPassword, setShowPassword] = useState(false)
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

  const inputType = isPasswordField
    ? showPassword
      ? 'text'
      : 'password'
    : (type ?? 'text')

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <div className={containerClasses}>
      <input
        id={inputId}
        type={inputType}
        className={inputClasses}
        disabled={disabled}
        {...props}
      />

      {isPasswordField && (
        <button
          type='button'
          className={styles.iconButton}
          onClick={togglePasswordVisibility}
          aria-label={
            showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
          }
        >
          {showPassword ? (
            <Eye className={styles.icon} />
          ) : (
            <EyeClosed className={styles.icon} />
          )}
        </button>
      )}
    </div>
  )
}
